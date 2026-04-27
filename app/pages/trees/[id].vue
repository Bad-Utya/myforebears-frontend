<script setup lang="ts">
import SideBar from '~/components/common/SideBar.vue'
import SidebarButtonList, { type SidebarButtonListItem } from '~/components/common/SidebarButtonList.vue'
import TreeSidebarPanel, { type TreeSidebarSection } from '~/components/tree/TreeSidebarPanel.vue'
import TreeCanvas from '~/components/tree/TreeCanvas.vue'
import type DataDTO from '~/composables/scripts/api/dtos/DataDTO'
import type TreeDTO from '~/composables/scripts/familytree/dtos/inner/TreeDTO'
import sendGetTreeContentRequest from '~/composables/scripts/familytree/getTreeContent'
import sendGetTreeRequest from '~/composables/scripts/familytree/getTree'
import type PersonDTO from '~/composables/scripts/familytree/dtos/inner/PersonDTO'
import type RelationshipDTO from '~/composables/scripts/familytree/dtos/inner/RelationshipDTO'
import type { GetTreeContentResponse } from '~/composables/scripts/familytree/dtos/responses/GetTreeContentResponse'
import type { GetTreeResponse } from '~/composables/scripts/familytree/dtos/responses/GetTreeResponse'
import adaptTreeVisualisation, { type TreeVisualLayout } from '~/composables/scripts/tree/adaptTreeVisualisation'
import resolveTreeRootPersonId, { getTreePersonId } from '~/composables/scripts/tree/resolveTreeRootPersonId'
import useUserDataHandler from '~/composables/scripts/storages/get/userDataHandler'
import showApiErrorToast from '~/composables/scripts/ui/showApiErrorToast'
import sendGetUserInfoRequest from '~/composables/scripts/users/getUserInfo'
import sendRenderCoordinatesForClientRequest from '~/composables/scripts/visualisations/renderCoordinatesForClient'
import type { GetUserInfoResponse } from '~/composables/scripts/users/dtos/responses/GetUserInfoResponse'

const route = useRoute()
const { userData, ensureLoaded } = useUserDataHandler()
const treeId = computed(() => {
  const routeId = route.params.id
  return Array.isArray(routeId) ? routeId[0] : routeId
})

const treeCanvasRef = ref<InstanceType<typeof TreeCanvas> | null>(null)
const pending = ref(true)
const tree = ref<TreeDTO | null>(null)
const treeName = ref('Tree')
const treeAuthorName = ref('')
const treeAuthorHref = ref<string | undefined>(undefined)
const rootPerson = ref<PersonDTO>()
const treeCreatorId = ref<string | number | null>(null)
const persons = ref<PersonDTO[]>([])
const relationships = ref<RelationshipDTO[]>([])
const sidebarPanelOpen = ref(false)
const sidebarSection = ref<TreeSidebarSection>('settings')
const layout = ref<TreeVisualLayout>({
  nodes: [],
  connections: [],
  width: 320,
  height: 320
})

const isEditable = computed(() => {
  const currentUserId = userData.value?.id

  if (currentUserId == null || treeCreatorId.value == null) {
    return false
  }

  return String(treeCreatorId.value) === String(currentUserId)
})

const sidebarItems = computed<SidebarButtonListItem<TreeSidebarSection>[]>(() => [
  { key: 'settings', label: 'Tree settings', icon: 'i-lucide-settings-2' },
  { key: 'events', label: 'Events', icon: 'i-lucide-calendar-days' }
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
  treeName.value = treeDto?.name ?? treeDto?.title ?? `Tree ${treeId.value}`
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

  treeAuthorName.value = author?.nickname?.trim() || `User ${creatorId}`
  treeAuthorHref.value = `/users/${creatorId}`
}

function getVisualisationMaxDepth() {
  return Math.max(8, Math.min(128, persons.value.length * 2))
}

function fitCanvas() {
  treeCanvasRef.value?.fitToView()
}

function openSidebarSection(section: TreeSidebarSection) {
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

    <UMain class="tree-page relative h-screen min-w-0 flex-1 overflow-hidden p-0">
      <TreeCanvas
        ref="treeCanvasRef"
        :tree-id="treeId ?? ''"
        :tree-name="treeName"
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
      :title="sidebarSection === 'settings' ? 'Tree settings' : 'Events'"
      :description="sidebarSection === 'settings' ? 'Configure this tree and manage access.' : 'Create and manage tree events.'"
      :ui="{ content: 'sm:max-w-xl' }"
    >
      <template #body>
        <TreeSidebarPanel
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

<style scoped>
.tree-page {
  background: var(--ui-bg);
}
</style>
