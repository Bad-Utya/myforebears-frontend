<script setup lang="ts">
import TreeCanvasViewport from '~/components/tree/TreeCanvasViewport.vue'
import TreeCanvasSummary from '~/components/tree/panels/TreeCanvasSummary.vue'
import TreeCanvasLoading from '~/components/tree/panels/TreeCanvasLoading.vue'
import TreeCanvasControls from '~/components/tree/panels/TreeCanvasControls.vue'
import TreeCanvasEmptyState from '~/components/tree/placeholders/TreeCanvasEmptyState.vue'
import CustomEntityCreateModal from '~/components/customTree/CustomEntityCreateModal.vue'
import type CustomEntityDTO from '~/services/customTrees/dtos/inner/CustomEntityDTO'
import type { CustomTreeVisualEdge, CustomTreeVisualNode } from '~/utils/ui/customTrees/customTreeLayout'
import { useTreeCanvasViewport } from '~/composables/trees/useTreeCanvasViewport'

const props = defineProps<{
  treeId: string
  treeName: string
  treeDescription?: string
  treeAuthorName?: string
  treeAuthorHref?: string
  nodes: CustomTreeVisualNode[]
  edges: CustomTreeVisualEdge[]
  width: number
  height: number
  editable: boolean
  pending: boolean
}>()
const emit = defineEmits<{ updated: [entity: CustomEntityDTO], structureChanged: [] }>()
const createOpen = ref(false)
const relativeId = ref('')
const direction = ref<'parent' | 'child'>('child')
const nodeMap = computed(() => new Map(props.nodes.map(node => [node.id, node])))
const visibleEdges = computed(() => props.edges.filter(edge => nodeMap.value.has(edge.parentId) && nodeMap.value.has(edge.childId)))
const childNodeIds = computed(() => new Set(visibleEdges.value.map(edge => edge.childId)))
const {
  viewportRef, scale, sceneStyle, isDragging, fitToView, zoomIn, zoomOut,
  setScale, startDragging, handleWheel
} = useTreeCanvasViewport(toRef(props, 'width'), toRef(props, 'height'), computed(() => props.nodes.length))

function openCreate(payload: { nodeId: string, direction: 'parent' | 'child' }) {
  relativeId.value = payload.nodeId
  direction.value = payload.direction
  createOpen.value = true
}
defineExpose({ fitToView, zoomIn, zoomOut })
</script>

<template>
  <div
    ref="viewportRef"
    class="relative h-full min-h-0 w-full overflow-hidden"
  >
    <TreeCanvasViewport
      :scene-style="sceneStyle"
      :is-dragging="isDragging"
      :pending="pending"
      @pointerdown="startDragging"
      @wheel="handleWheel"
    >
      <template #scene>
        <svg
          class="pointer-events-none h-full w-full overflow-visible"
          :viewBox="`0 0 ${width} ${height}`"
        >
          <CustomTreeConnection
            v-for="edge in visibleEdges"
            :key="edge.id"
            :parent="nodeMap.get(edge.parentId)!"
            :child="nodeMap.get(edge.childId)!"
          />
        </svg>
        <CustomTreeNode
          v-for="node in nodes"
          :key="node.id"
          :tree-id="treeId"
          :node="node"
          :editable="editable"
          :has-parent="childNodeIds.has(node.id)"
          @add="openCreate"
          @updated="emit('updated', $event)"
          @structure-changed="emit('structureChanged')"
        />
      </template>
      <template #overlay>
        <TreeCanvasSummary
          :pending="pending"
          :tree-name="treeName"
          :tree-description="treeDescription"
          :tree-author-name="treeAuthorName"
          :tree-author-href="treeAuthorHref"
        />
        <TreeCanvasLoading :pending="pending" />
        <TreeCanvasControls
          :scale="scale"
          :pending="pending"
          :has-nodes="nodes.length > 0"
          @zoom-in="zoomIn"
          @zoom-out="zoomOut"
          @fit-to-view="fitToView"
          @update-scale="setScale"
        />
      </template>
      <TreeCanvasEmptyState
        v-if="!pending && nodes.length === 0"
        :tree-name="treeName"
      />
    </TreeCanvasViewport>
    <CustomEntityCreateModal
      v-if="relativeId"
      v-model:open="createOpen"
      :tree-id="treeId"
      :relative-id="relativeId"
      :direction="direction"
      @created="emit('structureChanged')"
    />
  </div>
</template>
