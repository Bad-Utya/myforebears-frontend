<script setup lang="ts">
import SideBar from '~/components/common/SideBar.vue'
import TreeCanvas from '~/components/tree/TreeCanvas.vue'
import type DataDTO from '~/composables/scripts/api/dtos/DataDTO'
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
import sendRenderCoordinatesForClientRequest from '~/composables/scripts/visualisations/renderCoordinatesForClient'

const route = useRoute()
const { userData, ensureLoaded } = useUserDataHandler()
const treeId = computed(() => {
  const routeId = route.params.id
  return Array.isArray(routeId) ? routeId[0] : routeId
})

const treeCanvasRef = ref<InstanceType<typeof TreeCanvas> | null>(null)
const pending = ref(true)
const treeName = ref('Tree')
const rootPerson = ref<PersonDTO>()
const treeCreatorId = ref<string | number | null>(null)
const persons = ref<PersonDTO[]>([])
const relationships = ref<RelationshipDTO[]>([])
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

const peopleCountLabel = computed(() => {
  return `${persons.value.length} ${persons.value.length === 1 ? 'person' : 'people'}`
})

async function loadTreeData() {
  if (!treeId.value) {
    return
  }

  const [treeResponse, treeContentResponse] = await Promise.all([
    sendGetTreeRequest(treeId.value) as Promise<DataDTO<GetTreeResponse>>,
    sendGetTreeContentRequest(treeId.value) as Promise<DataDTO<GetTreeContentResponse>>
  ])
  const tree = treeResponse.data?.tree
  const treeContent = treeContentResponse.data

  treeName.value = tree?.name ?? tree?.title ?? `Tree ${treeId.value}`
  treeCreatorId.value = tree?.creator_id ?? null
  persons.value = Array.isArray(treeContent?.persons) ? treeContent.persons : []
  relationships.value = Array.isArray(treeContent?.relationships) ? treeContent.relationships : []

  const rootPersonId = resolveTreeRootPersonId(tree, persons.value)
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

function getVisualisationMaxDepth() {
  return Math.max(8, Math.min(128, persons.value.length * 2))
}

function fitCanvas() {
  treeCanvasRef.value?.fitToView()
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
    <SideBar :active-tab="null" />

    <UMain class="tree-page relative h-screen min-w-0 flex-1 overflow-hidden p-0">
      <TreeCanvas
        ref="treeCanvasRef"
        :tree-id="treeId ?? ''"
        :tree-name="treeName"
        :nodes="layout.nodes"
        :connections="layout.connections"
        :relationships="relationships"
        :width="layout.width"
        :height="layout.height"
        :editable="isEditable"
        @updated="handlePersonUpdated"
        @structure-changed="handleStructureChanged"
      />
    </UMain>
  </div>
</template>

<style scoped>
.tree-page {
  background: var(--ui-bg);
}
</style>
