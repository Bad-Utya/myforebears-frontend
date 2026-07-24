<script setup lang="ts">
import SideBar from '~/components/common/sidebar/SideBar.vue'
import SidebarButtonList, { type SidebarButtonListItem } from '~/components/common/sidebar/SidebarButtonList.vue'
import TreeCanvas from '~/components/tree/TreeCanvas.vue'
import type DataDTO from '~/services/api/dtos/DataDTO'
import type TreeDTO from '~/services/familytree/dtos/inner/TreeDTO'
import sendGetTreeContentRequest from '~/services/familytree/getTreeContent'
import sendGetTreeRequest from '~/services/familytree/getTree'
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import type RelationshipDTO from '~/services/familytree/dtos/inner/RelationshipDTO'
import type { GetTreeContentResponse } from '~/services/familytree/dtos/responses/GetTreeContentResponse'
import type { GetTreeResponse } from '~/services/familytree/dtos/responses/GetTreeResponse'
import adaptTreeVisualisation from '~/utils/ui/tree/coordinates/adaptTreeVisualisation'
import resolveTreeRootPersonId, { getTreePersonId } from '~/utils/ui/tree/resolveTreePersonId'
import useUserDataHandler from '~/utils/scripts/storages/get/userDataHandler'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import sendGetUserInfoRequest from '~/services/users/getUserInfo'
import sendRenderCoordinatesForClientRequest from '~/services/visualisations/renderCoordinatesForClient'
import type { GetUserInfoResponse } from '~/services/users/dtos/responses/GetUserInfoResponse'
import TreeSettingsSidebar from '~/components/tree/sidebar/TreeSettingsSidebar.vue'
import TreeEventsSidebar from '~/components/tree/sidebar/TreeEventsSidebar.vue'
import type { TreeVisualNode } from '~/utils/ui/tree/coordinates/computeNodes'
import type { TreeVisualConnection } from '~/utils/ui/tree/coordinates/computeConnections'
import TreeVisualizationsSidebar from '~/components/tree/sidebar/TreeVisualizationsSidebar.vue'
import TreePersonsSidebar from '~/components/tree/sidebar/TreePersonsSidebar.vue'
import { familyPersonToEventParticipant } from '~/utils/ui/events/eventParticipants'

type TreeSidebarSection = 'settings' | 'events' | 'export' | 'persons'
type TreeSidebarNavKey = TreeSidebarSection | 'timeline'

const { t } = useI18n()

const route = useRoute()
const { userData, ensureLoaded } = useUserDataHandler()
const treeId = computed(() => {
  const routeId = route.params.id
  return Array.isArray(routeId) ? routeId[0] : routeId
})

interface TreeLayout {
  nodes: TreeVisualNode[]
  connections: TreeVisualConnection[]
  width: number
  height: number
}

const treeCanvasRef = ref<InstanceType<typeof TreeCanvas> | null>(null)
const pending = ref(true)
const tree = ref<TreeDTO | null>(null)
const treeName = ref('Tree')
const treeDescription = ref('')
const treeAuthorName = ref('')
const treeAuthorHref = ref<string | undefined>(undefined)
const rootPerson = ref<PersonDTO>()
const treeCreatorId = ref<string | number | null>(null)
const persons = ref<PersonDTO[]>([])
const relationships = ref<RelationshipDTO[]>([])
const sidebarPanelOpen = ref(false)
const sidebarSection = ref<TreeSidebarSection>('settings')
const layout = ref<TreeLayout>({
  nodes: [],
  connections: [],
  width: 320,
  height: 320
})

const isEditable = computed(() => {
  const currentUserId = userData.value?.id

  if (!currentUserId || treeCreatorId.value == null) {
    return false
  }

  return String(treeCreatorId.value) === String(currentUserId)
})

const eventParticipants = computed(() => persons.value
  .map(familyPersonToEventParticipant)
  .filter((participant): participant is NonNullable<typeof participant> => Boolean(participant)))

const sidebarItems = computed<SidebarButtonListItem<TreeSidebarNavKey>[]>(() => [
  { key: 'settings', label: t('tree.navigation.settings'), icon: 'i-lucide-settings-2' },
  { key: 'persons', label: t('tree.navigation.persons'), icon: 'i-lucide-users' },
  { key: 'events', label: t('tree.navigation.events'), icon: 'i-lucide-calendar-days' },
  { key: 'export', label: t('tree.navigation.visualizations'), icon: 'i-lucide-external-link' },
  { key: 'timeline', label: t('tree.navigation.timeline'), icon: 'i-lucide-history' }
])

async function loadTreeData() {
  if (!treeId.value) {
    return
  }

  const [treeResponse, treeContentResponse] = await Promise.all([
    sendGetTreeRequest(treeId.value) as Promise<DataDTO<GetTreeResponse>>,
    sendGetTreeContentRequest(treeId.value) as Promise<DataDTO<GetTreeContentResponse>>
  ])
  const treeDto = treeResponse.data?.tree
  const treeContent = treeContentResponse.data

  tree.value = treeDto ?? null
  treeName.value = treeDto?.name ?? treeDto?.title ?? `${t('tree.canvas.fallback_name')} ${treeId.value}`
  treeDescription.value = treeDto?.description?.trim() ?? ''
  treeCreatorId.value = treeDto?.creator_id ?? null
  persons.value = Array.isArray(treeContent?.persons) ? treeContent.persons : []
  relationships.value = Array.isArray(treeContent?.relationships) ? treeContent.relationships : []

  await loadTreeAuthor()

  const rootPersonId = resolveTreeRootPersonId(treeDto, persons.value)
  rootPerson.value = persons.value.find(person => getTreePersonId(person) === rootPersonId)

  try {
    const coordinatesResponse = await sendRenderCoordinatesForClientRequest(
      treeId.value,
      rootPersonId,
      getVisualisationMaxDepth()
    ) as DataDTO<Record<string, unknown>>

    layout.value = adaptTreeVisualisation(
      coordinatesResponse.data,
      persons.value,
      relationships.value,
      rootPersonId
    )
  } catch (visualisationError) {
    console.warn('Failed to load visualisation coordinates, using fallback layout.', visualisationError)
    layout.value = adaptTreeVisualisation(
      undefined,
      persons.value,
      relationships.value,
      rootPersonId
    )
  }

  await nextTick()
  fitCanvas()
}

async function loadTreeAuthor() {
  const creatorId = Number(treeCreatorId.value)

  if (!Number.isFinite(creatorId) || creatorId <= 0) {
    treeAuthorName.value = ''
    treeAuthorHref.value = undefined
    return
  }

  const response = await sendGetUserInfoRequest(creatorId) as DataDTO<GetUserInfoResponse>
  const author = response.data?.user

  treeAuthorName.value = author?.nickname?.trim() || t('tree.canvas.author_fallback', { id: creatorId })
  treeAuthorHref.value = `/users/${creatorId}` // TODO: fix shitcode
}

function getVisualisationMaxDepth() {
  return Math.max(8, Math.min(128, persons.value.length * 2))
}

function fitCanvas() {
  treeCanvasRef.value?.fitToView()
}

async function openSidebarSection(section: TreeSidebarNavKey) {
  if (section === 'timeline') {
    await navigateTo(`/trees/${treeId.value}/timeline`)
    return
  }

  sidebarSection.value = section
  sidebarPanelOpen.value = true
}

async function handleStructureChanged() {
  pending.value = true

  try {
    await loadTreeData()
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    pending.value = false
  }
}

function handlePersonUpdated(updatedPerson: PersonDTO) {
  const updatedPersonId = getTreePersonId(updatedPerson)

  persons.value = persons.value.map((person) => {
    return getTreePersonId(person) === updatedPersonId ? updatedPerson : person
  })
  rootPerson.value = persons.value.find(person => getTreePersonId(person) === updatedPersonId) ?? rootPerson.value
  layout.value = {
    ...layout.value,
    nodes: layout.value.nodes.map((node) => {
      return node.id === updatedPersonId
        ? { ...node, person: updatedPerson }
        : node
    })
  }
}

function handleTreeUpdated(updatedTree: TreeDTO) {
  tree.value = updatedTree
  treeName.value = updatedTree.name ?? updatedTree.title ?? treeName.value
  treeDescription.value = updatedTree.description?.trim() ?? ''
  treeCreatorId.value = updatedTree.creator_id ?? treeCreatorId.value
  void loadTreeAuthor()
}

async function handleTreeDeleted() {
  await navigateTo('/my')
}

onMounted(async () => {
  if (!treeId.value) {
    pending.value = false
    return
  }

  try {
    await ensureLoaded()
    await loadTreeData()
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    pending.value = false
  }
})
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar :active-tab="null">
      <template #side>
        <SidebarButtonList
          :items="sidebarItems"
          :active-key="sidebarPanelOpen ? sidebarSection : null"
          @select="openSidebarSection"
        />
      </template>
    </SideBar>

    <UMain class="bg-ui-bg relative h-screen flex-1 overflow-hidden">
      <TreeCanvas
        ref="treeCanvasRef"
        :tree-id="treeId ?? ''"
        :tree-name="treeName"
        :tree-description="treeDescription"
        :tree-author-name="treeAuthorName"
        :tree-author-href="treeAuthorHref"
        :nodes="layout.nodes"
        :connections="layout.connections"
        :relationships="relationships"
        :width="layout.width"
        :height="layout.height"
        :editable="isEditable"
        :pending="pending"
        @updated="handlePersonUpdated"
        @structure-changed="handleStructureChanged"
      />
    </UMain>

    <USlideover
      v-model:open="sidebarPanelOpen"
      side="right"
      :title="sidebarItems.find(i => i.key === sidebarSection)?.label ?? t('tree.panels.unknown')"
      :ui="{ content: 'bg-default' }"
    >
      <template #body>
        <TreeSettingsSidebar
          v-if="sidebarSection === 'settings'"
          :tree-id="treeId ?? ''"
          :tree="tree"
          :persons="persons"
          :editable="isEditable"
          :pending="pending"
          @tree-updated="handleTreeUpdated"
          @tree-deleted="handleTreeDeleted"
        />
        <TreeEventsSidebar
          v-else-if="sidebarSection === 'events'"
          :tree-id="treeId ?? ''"
          :tree="tree"
          :participants="eventParticipants"
          :editable="isEditable"
          :pending="pending"
          :section="sidebarSection"
          @tree-updated="handleTreeUpdated"
          @tree-deleted="handleTreeDeleted"
        />
        <TreePersonsSidebar
          v-else-if="sidebarSection === 'persons'"
          :tree-id="treeId ?? ''"
          :persons="persons"
          :editable="isEditable"
          @updated="handlePersonUpdated"
          @structure-changed="handleStructureChanged"
        />
        <TreeVisualizationsSidebar
          v-else
          :tree-id="treeId ?? ''"
          :tree="tree"
          :persons="persons"
          :editable="isEditable"
          :pending="pending"
          :section="sidebarSection"
          @tree-updated="handleTreeUpdated"
          @tree-deleted="handleTreeDeleted"
        />
      </template>
    </USlideover>
  </div>
</template>
