<script setup lang="ts">
import SideBar from '~/components/common/sidebar/SideBar.vue'
import SidebarButtonList, { type SidebarButtonListItem } from '~/components/common/sidebar/SidebarButtonList.vue'
import CustomTreeCanvas from '~/components/customTree/CustomTreeCanvas.vue'
import CustomTreeSettingsSidebar from '~/components/customTree/CustomTreeSettingsSidebar.vue'
import CustomEntitiesSidebar from '~/components/customTree/CustomEntitiesSidebar.vue'
import TreeEventsSidebar from '~/components/tree/sidebar/TreeEventsSidebar.vue'
import type CustomTreeDTO from '~/services/customTrees/dtos/inner/CustomTreeDTO'
import type CustomEntityDTO from '~/services/customTrees/dtos/inner/CustomEntityDTO'
import type CustomEdgeDTO from '~/services/customTrees/dtos/inner/CustomEdgeDTO'
import sendGetCustomTreeRequest from '~/services/customTrees/getCustomTree'
import sendGetCustomTreeContentRequest from '~/services/customTrees/getCustomTreeContent'
import sendGetCustomTreeCoordinatesRequest from '~/services/customTrees/getCustomTreeCoordinates'
import sendGetUserInfoRequest from '~/services/users/getUserInfo'
import adaptCustomTreeLayout, { type CustomTreeLayout } from '~/utils/ui/customTrees/customTreeLayout'
import {
  clearCustomEntityAvatarCache,
  preloadCustomEntityAvatars
} from '~/composables/customTrees/useCustomEntityAvatar'
import { customEntityToEventParticipant } from '~/utils/ui/events/eventParticipants'
import useUserDataHandler from '~/utils/scripts/storages/get/userDataHandler'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

type Section = 'settings' | 'entities' | 'events'
type NavKey = Section | 'timeline'
const { t } = useI18n()
const route = useRoute()
const { userData, ensureLoaded } = useUserDataHandler()
const treeId = computed(() => String(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id ?? ''))
const tree = ref<CustomTreeDTO | null>(null)
const entities = ref<CustomEntityDTO[]>([])
const edges = ref<CustomEdgeDTO[]>([])
const pending = ref(true)
const authorName = ref('')
const authorHref = ref<string>()
const panelOpen = ref(false)
const section = ref<Section>('settings')
const canvas = ref<InstanceType<typeof CustomTreeCanvas> | null>(null)
const layout = ref<CustomTreeLayout>({ nodes: [], edges: [], width: 320, height: 320 })
const editable = computed(() => Boolean(userData.value?.id && String(userData.value.id) === String(tree.value?.creator_id)))
const participants = computed(() => entities.value.map(customEntityToEventParticipant).filter((item): item is NonNullable<typeof item> => Boolean(item)))
const items = computed<SidebarButtonListItem<NavKey>[]>(() => [
  { key: 'settings', label: t('tree.navigation.settings'), icon: 'i-lucide-settings-2' },
  { key: 'entities', label: t('custom_tree.navigation.entities'), icon: 'i-lucide-circle-dot' },
  { key: 'events', label: t('tree.navigation.events'), icon: 'i-lucide-calendar-days' },
  { key: 'timeline', label: t('tree.navigation.timeline'), icon: 'i-lucide-history' }
])

async function load() {
  if (!treeId.value) return
  const [treeResponse, contentResponse] = await Promise.all([
    sendGetCustomTreeRequest(treeId.value), sendGetCustomTreeContentRequest(treeId.value)
  ])
  const treeDto = treeResponse.data?.tree ?? contentResponse.data?.tree ?? null
  const resolvedRootEntityId = treeDto?.root_entity_id ?? treeResponse.data?.root_entity?.id
  tree.value = treeDto && resolvedRootEntityId
    ? { ...treeDto, root_entity_id: resolvedRootEntityId }
    : treeDto
  edges.value = contentResponse.data?.edges ?? []
  let rootEntityId = tree.value?.root_entity_id
  const coordinates = await sendGetCustomTreeCoordinatesRequest(treeId.value, rootEntityId)
  rootEntityId ??= coordinates.data?.nodes?.[0]?.entity_id
  if (tree.value && rootEntityId && !tree.value.root_entity_id) {
    tree.value = { ...tree.value, root_entity_id: rootEntityId }
  }

  const entityById = new Map<string, CustomEntityDTO>()
  for (const entity of contentResponse.data?.entities ?? []) {
    if (entity.id) entityById.set(entity.id, entity)
  }
  const rootEntity = treeResponse.data?.root_entity
  if (rootEntity?.id) {
    entityById.set(rootEntity.id, {
      ...entityById.get(rootEntity.id),
      ...rootEntity
    })
  }
  for (const node of coordinates.data?.nodes ?? []) {
    if (!node.entity_id) continue
    const current = entityById.get(node.entity_id)
    entityById.set(node.entity_id, {
      ...current,
      id: node.entity_id,
      tree_id: current?.tree_id ?? treeId.value,
      name: current?.name ?? node.name,
      avatar_photo_id: current?.avatar_photo_id ?? node.avatar_photo_id
    })
  }
  entities.value = [...entityById.values()]
  await preloadCustomEntityAvatars(treeId.value, entities.value)
  layout.value = adaptCustomTreeLayout(coordinates.data, entities.value, edges.value, rootEntityId)
  const creatorId = tree.value?.creator_id
  if (creatorId) {
    const response = await sendGetUserInfoRequest(creatorId)
    authorName.value = response.data?.user?.nickname ?? t('tree.canvas.author_fallback', { id: creatorId })
    authorHref.value = `/users/${creatorId}`
  }
  await nextTick()
  canvas.value?.fitToView()
}

async function reload() {
  pending.value = true
  try {
    await load()
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    pending.value = false
  }
}

function updateEntity(updated: CustomEntityDTO) {
  entities.value = entities.value.map(entity => entity.id === updated.id ? updated : entity)
  layout.value = { ...layout.value, nodes: layout.value.nodes.map(node => node.id === updated.id ? { ...node, entity: updated } : node) }
}

async function updateTree(updated: CustomTreeDTO) {
  tree.value = updated
  await reload()
}

async function select(next: NavKey) {
  if (next === 'timeline') return navigateTo(`/custom-trees/${treeId.value}/timeline`)
  section.value = next
  panelOpen.value = true
}

onMounted(async () => {
  await ensureLoaded()
  await reload()
})

onBeforeUnmount(() => {
  clearCustomEntityAvatarCache(treeId.value)
})
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar :active-tab="null">
      <template #side>
        <SidebarButtonList
          :items="items"
          :active-key="panelOpen ? section : null"
          @select="select"
        />
      </template>
    </SideBar>
    <UMain class="bg-ui-bg relative h-screen flex-1 overflow-hidden">
      <CustomTreeCanvas
        ref="canvas"
        :tree-id="treeId"
        :tree-name="tree?.name ?? t('custom_tree.fallback_name')"
        :tree-description="tree?.description"
        :tree-author-name="authorName"
        :tree-author-href="authorHref"
        :nodes="layout.nodes"
        :edges="layout.edges"
        :width="layout.width"
        :height="layout.height"
        :editable="editable"
        :pending="pending"
        @updated="updateEntity"
        @structure-changed="reload"
      />
    </UMain>
    <USlideover
      v-model:open="panelOpen"
      side="right"
      :title="items.find(item => item.key === section)?.label"
      :ui="{ content: 'bg-default' }"
    >
      <template #body>
        <CustomTreeSettingsSidebar
          v-if="section === 'settings'"
          :tree-id="treeId"
          :tree="tree"
          :entities="entities"
          :editable="editable"
          :pending="pending"
          @updated="updateTree"
          @deleted="navigateTo('/my')"
        />
        <CustomEntitiesSidebar
          v-else-if="section === 'entities'"
          :tree-id="treeId"
          :entities="entities"
          :editable="editable"
          @updated="updateEntity"
          @structure-changed="reload"
        />
        <TreeEventsSidebar
          v-else
          :tree-id="treeId"
          :tree="null"
          :participants="participants"
          :editable="editable"
        />
      </template>
    </USlideover>
  </div>
</template>
