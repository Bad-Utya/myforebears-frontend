<script setup lang="ts">
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import type RelationshipDTO from '~/services/familytree/dtos/inner/RelationshipDTO'

import TreeCanvasViewport from '~/components/tree/TreeCanvasViewport.vue'
import TreeCanvasSummary from "~/components/tree/panels/TreeCanvasSummary.vue";
import TreeCanvasConnectionLayer from "~/components/tree/layers/TreeCanvasConnectionLayer.vue";
import TreeCanvasNodeLayer from "~/components/tree/layers/TreeCanvasNodeLayer.vue";
import TreeCanvasEmptyState from "~/components/tree/placeholders/TreeCanvasEmptyState.vue";
import TreeCanvasLoading from "~/components/tree/panels/TreeCanvasLoading.vue";
import TreeCanvasControls from "~/components/tree/panels/TreeCanvasControls.vue";
import TreeCanvasActionLayer from "~/components/tree/layers/TreeCanvasActionLayer.vue";

import {useTreeCanvasViewport} from '~/composables/trees/useTreeCanvasViewport'
import {useTreeRelationshipActions} from '~/composables/trees/useTreeRelationshipActions'

import type {TreeVisualNode} from "~/utils/ui/tree/coordinates/computeNodes";
import type {TreeVisualConnection} from "~/utils/ui/tree/coordinates/computeConnections";
import TreeCreatePersonModal from "~/components/tree/modals/person/TreeCreatePersonModal.vue";

const props = defineProps<{
  treeId: string
  treeName: string
  treeDescription?: string
  treeAuthorName?: string
  treeAuthorHref?: string
  nodes: TreeVisualNode[]
  connections: TreeVisualConnection[]
  relationships: RelationshipDTO[]
  width: number
  height: number
  editable?: boolean
  pending?: boolean
}>()

const emit = defineEmits<{
  updated: [person: PersonDTO]
  structureChanged: []
}>()

const createModalOpen = ref(false)
const activeCreateAction = ref<'child' | 'parent' | 'partner' | null>(null)
const createRelatedPersonIds = ref<string[]>([])
const partnerId = ref<string | null>(null)
const availableParentRoles = ref<('FATHER' | 'MOTHER')[]>([])
const person = ref<PersonDTO | null>(null)

function openCreateModal({
                           nodeId,
                           action,
                           relatedPersonIds,
                           event
                         }: {
  nodeId: string
  action: 'child' | 'parent' | 'partner'
  relatedPersonIds?: string[]
  event: MouseEvent
}) {
  event.stopPropagation()

  activeCreateAction.value = action
  createRelatedPersonIds.value = relatedPersonIds ?? []
  createModalOpen.value = true

  if (relatedPersonIds?.length === 2 && action === 'child') {
    partnerId.value = relatedPersonIds[1] ?? null
  } else {
    partnerId.value = null
  }

  person.value = props.nodes.find(n => n.id === nodeId)?.person ?? null

  availableParentRoles.value = getAvailableParentRoles(nodeId)
}

const nodeMap = computed(() => new Map(props.nodes.map(node => [node.id, node])))

const visibleConnections = computed(() =>
  props.connections.filter(c => nodeMap.value.has(c.fromId) && nodeMap.value.has(c.toId))
)

const {
  viewportRef,
  scale,
  sceneStyle,
  isDragging,
  fitToView,
  zoomIn,
  zoomOut,
  setScale,
  startDragging,
  handleWheel
} = useTreeCanvasViewport(
  toRef(props, 'width'),
  toRef(props, 'height'),
  computed(() => props.nodes.length)
)

const {
  nodeActions,
  partnerChildActions,
  getPartnerId,
  getPersonRoleLabel,
  getAvailableParentRoles
} = useTreeRelationshipActions(
  computed(() => props.nodes),
  computed(() => props.relationships),
  computed(() => props.editable)
)

defineExpose({
  fitToView,
  zoomIn,
  zoomOut
})
</script>

<template>
  <div ref="viewportRef" class="relative w-full h-full min-h-0 overflow-hidden">
    <TreeCanvasViewport
      :scene-style="sceneStyle"
      :is-dragging="isDragging"
      :pending="props.pending"
      @pointerdown="startDragging"
      @wheel="handleWheel"
    >
      <template #scene>
        <TreeCanvasConnectionLayer
          :visible-connections="visibleConnections"
          :node-map="nodeMap"
          :relationships="props.relationships"
          :width="props.width"
          :height="props.height"
        />

        <TreeCanvasActionLayer
          v-if="props.editable"
          :node-actions="nodeActions"
          :partner-child-actions="partnerChildActions"
          @open-create-modal="openCreateModal"
        />

        <TreeCanvasNodeLayer
          :nodes="props.nodes"
          :tree-id="props.treeId"
          :editable="props.editable"
          :node-actions="nodeActions"
          :partner-child-actions="partnerChildActions"
          :get-partner-id="getPartnerId"
          :get-person-role-label="getPersonRoleLabel"
          :get-available-parent-roles="getAvailableParentRoles"
          @updated="emit('updated', $event)"
          @structure-changed="emit('structureChanged')"
        />
      </template>

      <template #overlay>
        <TreeCanvasSummary
          :pending="props.pending"
          :tree-name="props.treeName"
          :tree-description="props.treeDescription"
          :tree-author-name="props.treeAuthorName"
          :tree-author-href="props.treeAuthorHref"
        />

        <TreeCanvasLoading :pending="props.pending" />

        <TreeCanvasControls
          :scale="scale"
          :pending="props.pending"
          :has-nodes="props.nodes.length > 0"
          @zoom-in="zoomIn"
          @zoom-out="zoomOut"
          @fit-to-view="fitToView"
          @update-scale="setScale"
        />
      </template>

      <TreeCanvasEmptyState
        v-if="!props.pending && props.nodes.length == 0"
        :tree-name="props.treeName"
      />
    </TreeCanvasViewport>

    <TreeCreatePersonModal
      v-model:open="createModalOpen"
      :tree-id="props.treeId"
      :person="person!"
      :partner-id="partnerId!"
      :available-parent-roles="availableParentRoles"
      :action="activeCreateAction"
      :related-person-ids="createRelatedPersonIds"
      @created="emit('structureChanged')"
    />
  </div>
</template>
