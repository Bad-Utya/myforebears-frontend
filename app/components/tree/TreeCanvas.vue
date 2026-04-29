<script setup lang="ts">
import TreeConnection from '~/components/tree/TreeConnection.vue'
import TreeNode from '~/components/tree/TreeNode.vue'
import type PersonDTO from '~/composables/scripts/familytree/dtos/inner/PersonDTO'
import type RelationshipDTO from '~/composables/scripts/familytree/dtos/inner/RelationshipDTO'
import type {
  TreeVisualConnection,
  TreeVisualNode
} from '~/composables/scripts/tree/adaptTreeVisualisation'

type TreeNodeExpose = {
  openCreateModal: (
    action: 'child' | 'parent' | 'partner',
    event?: Event,
    relatedPersonIds?: string[]
  ) => void
}

const MIN_SCALE = 0.34
const MAX_SCALE = 1.6
const SCALE_STEP = 0.12

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

const viewportRef = ref<HTMLElement | null>(null)
const translateX = ref(0)
const translateY = ref(0)
const scale = ref(1)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragOriginX = ref(0)
const dragOriginY = ref(0)
let resizeObserver: ResizeObserver | undefined
const treeNodeRefs = new Map<string, TreeNodeExpose>()

const nodeMap = computed(() => new Map(props.nodes.map(node => [node.id, node])))
const scalePercentLabel = computed(() => `${Math.round(scale.value * 100)}%`)

function isPartnerRelationshipType(type?: string) {
  return typeof type === 'string' && type.includes('PARTNER')
}

function isParentChildRelationshipType(type?: string) {
  return type === 'RELATIONSHIP_PARENT_CHILD'
}

const visibleConnections = computed(() => {
  return props.connections.filter((connection) => {
    return nodeMap.value.has(connection.fromId) && nodeMap.value.has(connection.toId)
  })
})

const nodeActions = computed(() => {
  if (!props.editable) {
    return []
  }

  return props.nodes.flatMap((node) => {
    const actions: Array<{
      id: string
      nodeId: string
      action: 'parent' | 'partner' | 'child'
      label: string
      icon: string
      anchorClass: string
      x: number
      y: number
    }> = []

    const availableParentRoles = getAvailableParentRoles(node.id)
    const hasPartner = Boolean(getPartnerId(node.id))

    if (availableParentRoles.length > 0) {
      actions.push({
        id: `${node.id}-parent`,
        nodeId: node.id,
        action: 'parent',
        label: 'Parent',
        icon: 'i-lucide-arrow-up-to-line',
        anchorClass: 'tree-canvas__node-action-anchor--top-left',
        x: node.x,
        y: node.y
      })
    }

    if (!hasPartner) {
      actions.push({
        id: `${node.id}-partner`,
        nodeId: node.id,
        action: 'partner',
        label: 'Partner',
        icon: 'i-lucide-heart-plus',
        anchorClass: 'tree-canvas__node-action-anchor--top-right',
        x: node.x + node.width,
        y: node.y
      })

      actions.push({
        id: `${node.id}-child`,
        nodeId: node.id,
        action: 'child',
        label: 'Child',
        icon: 'i-lucide-baby',
        anchorClass: 'tree-canvas__node-action-anchor--bottom-left',
        x: node.x,
        y: node.y + node.height
      })
    }

    return actions
  })
})

const partnerChildActions = computed(() => {
  if (!props.editable) {
    return []
  }

  const seenPairs = new Set<string>()

  return props.relationships.flatMap((relationship) => {
    if (!isPartnerRelationshipType(relationship.type)) {
      return []
    }

    const fromId = relationship.person_id_from
    const toId = relationship.person_id_to

    if (!fromId || !toId) {
      return []
    }

    const fromNode = nodeMap.value.get(fromId)
    const toNode = nodeMap.value.get(toId)

    if (!fromNode || !toNode) {
      return []
    }

    const pairKey = [fromNode.id, toNode.id].sort().join(':')

    if (seenPairs.has(pairKey)) {
      return []
    }

    seenPairs.add(pairKey)

    const leftNode = fromNode.x <= toNode.x ? fromNode : toNode
    const rightNode = leftNode.id === fromNode.id ? toNode : fromNode
    const startX = leftNode.x + leftNode.width
    const startY = leftNode.y + leftNode.height / 2
    const endX = rightNode.x
    const endY = rightNode.y + rightNode.height / 2

    return [{
      id: `child-action-${pairKey}`,
      nodeId: leftNode.id,
      relatedPersonIds: [leftNode.id, rightNode.id],
      x: (startX + endX) / 2,
      y: (startY + endY) / 2 - 20
    }]
  })
})

function getPartnerId(nodeId: string) {
  const partnerRelationship = props.relationships.find((relationship) => {
    return isPartnerRelationshipType(relationship.type)
      && (relationship.person_id_from === nodeId || relationship.person_id_to === nodeId)
  })

  if (!partnerRelationship) {
    return undefined
  }

  return partnerRelationship.person_id_from === nodeId
    ? partnerRelationship.person_id_to
    : partnerRelationship.person_id_from
}

function getAvailableParentRoles(nodeId: string): ('FATHER' | 'MOTHER')[] {
  const parentConnections = props.relationships.filter((relationship) => {
    return isParentChildRelationshipType(relationship.type)
      && relationship.person_id_to === nodeId
  })

  const hasFather = parentConnections.some((connection) => {
    return nodeMap.value.get(connection.person_id_from ?? '')?.person.gender === 'GENDER_MALE'
  })
  const hasMother = parentConnections.some((connection) => {
    return nodeMap.value.get(connection.person_id_from ?? '')?.person.gender === 'GENDER_FEMALE'
  })
  const roles: ('FATHER' | 'MOTHER')[] = []

  if (!hasFather) {
    roles.push('FATHER')
  }

  if (!hasMother) {
    roles.push('MOTHER')
  }

  return roles
}

function getPersonRoleLabel(nodeId: string) {
  const hasChildren = props.relationships.some((relationship) => {
    return isParentChildRelationshipType(relationship.type)
      && relationship.person_id_from === nodeId
  })

  if (!hasChildren) {
    return 'Family member'
  }

  const gender = nodeMap.value.get(nodeId)?.person.gender

  if (gender === 'GENDER_MALE') {
    return 'Father'
  }

  if (gender === 'GENDER_FEMALE') {
    return 'Mother'
  }

  return 'Parent'
}

const sceneStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  transform: `translate3d(${translateX.value}px, ${translateY.value}px, 0) scale(${scale.value})`
}))

function fitToView() {
  const viewport = viewportRef.value

  if (!viewport || props.nodes.length === 0) {
    return
  }

  const viewportWidth = viewport.clientWidth
  const viewportHeight = viewport.clientHeight
  const horizontalPadding = 96
  const verticalPadding = 96
  const availableWidth = Math.max(240, viewportWidth - horizontalPadding * 2)
  const availableHeight = Math.max(240, viewportHeight - verticalPadding * 2)
  const nextScale = Math.min(
    1,
    availableWidth / props.width,
    availableHeight / props.height
  )

  scale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale))
  translateX.value = (viewportWidth - props.width * scale.value) / 2
  translateY.value = (viewportHeight - props.height * scale.value) / 2
}

function setScale(nextScale: number, anchorRatioX = 0.5, anchorRatioY = 0.5) {
  const viewport = viewportRef.value

  if (!viewport) {
    return
  }

  const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale))
  const anchorX = viewport.clientWidth * anchorRatioX
  const anchorY = viewport.clientHeight * anchorRatioY
  const sceneCenterX = (anchorX - translateX.value) / scale.value
  const sceneCenterY = (anchorY - translateY.value) / scale.value

  translateX.value = anchorX - sceneCenterX * clampedScale
  translateY.value = anchorY - sceneCenterY * clampedScale
  scale.value = clampedScale
}

function zoomIn() {
  setScale(scale.value + SCALE_STEP)
}

function zoomOut() {
  setScale(scale.value - SCALE_STEP)
}

function startDragging(event: PointerEvent) {
  const target = event.target as HTMLElement | null

  if (props.pending || target?.closest('[data-tree-node="true"]')) {
    return
  }

  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragOriginX.value = translateX.value
  dragOriginY.value = translateY.value
}

function handlePointerMove(event: PointerEvent) {
  if (!isDragging.value) {
    return
  }

  translateX.value = dragOriginX.value + event.clientX - dragStartX.value
  translateY.value = dragOriginY.value + event.clientY - dragStartY.value
}

function stopDragging() {
  isDragging.value = false
}

function handleWheel(event: WheelEvent) {
  event.preventDefault()

  const viewport = viewportRef.value
  const bounds = viewport?.getBoundingClientRect()

  if (!bounds) {
    return
  }

  const anchorRatioX = (event.clientX - bounds.left) / bounds.width
  const anchorRatioY = (event.clientY - bounds.top) / bounds.height
  const direction = event.deltaY > 0 ? -1 : 1

  setScale(
    scale.value + direction * SCALE_STEP,
    Math.max(0, Math.min(1, anchorRatioX)),
    Math.max(0, Math.min(1, anchorRatioY))
  )
}

function setTreeNodeRef(nodeId: string, instance: TreeNodeExpose | null) {
  if (instance) {
    treeNodeRefs.set(nodeId, instance)
    return
  }

  treeNodeRefs.delete(nodeId)
}

function openPartnerChildModal(nodeId: string, relatedPersonIds: string[], event: MouseEvent) {
  event.stopPropagation()
  treeNodeRefs.get(nodeId)?.openCreateModal('child', event, relatedPersonIds)
}

function openNodeActionModal(
  nodeId: string,
  action: 'parent' | 'partner' | 'child',
  event: MouseEvent
) {
  event.stopPropagation()
  treeNodeRefs.get(nodeId)?.openCreateModal(action, event)
}

defineExpose({
  fitToView,
  zoomIn,
  zoomOut
})

watch(
  () => [props.width, props.height, props.nodes.length],
  () => {
    nextTick(() => fitToView())
  },
  { immediate: true }
)

onMounted(() => {
  const viewport = viewportRef.value

  if (!viewport) {
    return
  }

  resizeObserver = new ResizeObserver(() => fitToView())
  resizeObserver.observe(viewport)

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', stopDragging)
  window.addEventListener('pointercancel', stopDragging)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', stopDragging)
  window.removeEventListener('pointercancel', stopDragging)
})
</script>

<template>
  <div
    ref="viewportRef"
    class="tree-canvas relative h-full w-full overflow-hidden"
    :class="{ 'tree-canvas--dragging': isDragging }"
    :aria-busy="props.pending"
    @pointerdown="startDragging"
    @wheel.prevent="handleWheel"
  >
    <div class="tree-canvas__grid absolute inset-0" aria-hidden="true" />

    <div class="tree-canvas__summary absolute left-5 top-5 z-10 max-w-[min(28rem,calc(100%-8rem))] rounded-2xl border border-default bg-default/92 px-4 py-3 shadow-lg backdrop-blur">
      <template v-if="props.pending">
        <USkeleton class="h-5 w-40 rounded" />
        <USkeleton class="mt-2 h-4 w-28 rounded" />
      </template>
      <template v-else>
        <p class="text-sm font-semibold text-highlighted">
          {{ treeName }}
        </p>
        <p v-if="props.treeDescription?.trim()" class="mt-2 line-clamp-3 text-xs text-toned">
          {{ props.treeDescription }}
        </p>
        <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span>By</span>
          <NuxtLink
            v-if="props.treeAuthorHref"
            :to="props.treeAuthorHref"
            class="font-medium text-primary hover:text-primary/80"
          >
            {{ props.treeAuthorName || 'Unknown author' }}
          </NuxtLink>
          <span v-else class="font-medium text-highlighted">
            {{ props.treeAuthorName || 'Unknown author' }}
          </span>
        </div>
      </template>
    </div>

    <div
      v-if="nodes.length > 0"
      class="tree-canvas__scene absolute left-0 top-0"
      :style="sceneStyle"
    >
      <svg
        class="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        :viewBox="`0 0 ${width} ${height}`"
      >
        <TreeConnection
          v-for="connection in visibleConnections"
          :key="connection.id"
          :from-node="nodeMap.get(connection.fromId)!"
          :to-node="nodeMap.get(connection.toId)!"
          :connection="connection"
          :connections="visibleConnections"
          :relationships="relationships"
          :node-map="nodeMap"
        />
      </svg>

      <div
        v-for="action in nodeActions"
        :key="action.id"
        class="tree-canvas__node-action-anchor"
        :class="action.anchorClass"
        :style="{
          left: `${action.x}px`,
          top: `${action.y}px`
        }"
      >
        <UButton
          size="xs"
          color="neutral"
          variant="soft"
          :icon="action.icon"
          class="tree-canvas__node-action"
          @click="openNodeActionModal(action.nodeId, action.action, $event)"
        >
          {{ action.label }}
        </UButton>
      </div>

      <div
        v-for="action in partnerChildActions"
        :key="action.id"
        class="tree-canvas__partner-child-action-anchor"
        :style="{
          left: `${action.x}px`,
          top: `${action.y}px`
        }"
      >
        <UButton
          size="xs"
          color="neutral"
          variant="soft"
          icon="i-lucide-baby"
          class="tree-canvas__partner-child-action"
          @click="openPartnerChildModal(action.nodeId, action.relatedPersonIds, $event)"
        >
          Child
        </UButton>
      </div>

      <TreeNode
        v-for="node in nodes"
        :key="node.id"
        :ref="(instance) => setTreeNodeRef(node.id, instance as TreeNodeExpose | null)"
        :tree-id="treeId"
        :person="node.person"
        :x="node.x"
        :y="node.y"
        :width="node.width"
        :height="node.height"
        :is-root="node.isRoot"
        :editable="props.editable"
        :partner-id="getPartnerId(node.id)"
        :role-label="getPersonRoleLabel(node.id)"
        :available-parent-roles="getAvailableParentRoles(node.id)"
        @updated="emit('updated', $event)"
        @structure-changed="emit('structureChanged')"
      />
    </div>

    <div v-else-if="!props.pending" class="absolute inset-0 flex items-center justify-center p-6">
      <div class="px-6 py-5 text-center">
        <p class="text-sm text-muted">
          No tree content available for {{ treeName }}
        </p>
      </div>
    </div>

    <div class="tree-canvas__controls absolute bottom-5 right-5 z-10 flex items-center gap-2 rounded-2xl border border-default bg-default/92 p-2 shadow-lg backdrop-blur">
      <UButton color="neutral" variant="ghost" icon="i-lucide-minus" :disabled="props.pending" @click="zoomOut" />
      <UButton color="neutral" variant="ghost" icon="i-lucide-scan-search" :disabled="props.pending || nodes.length === 0" @click="fitToView" />
      <UButton color="neutral" variant="ghost" icon="i-lucide-plus" :disabled="props.pending" @click="zoomIn" />
      <span class="min-w-14 text-center text-xs font-medium text-muted">{{ scalePercentLabel }}</span>
    </div>

    <div v-if="props.pending" class="tree-canvas__loading absolute inset-0 z-[5] flex items-center justify-center backdrop-blur-[2px]">
      <div class="flex items-center gap-3 rounded-full border border-default bg-default/90 px-4 py-2 text-sm text-highlighted shadow-lg">
        <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
        Loading tree
      </div>
    </div>
  </div>
</template>

<style scoped>
.tree-canvas {
  --tree-node-bg: color-mix(in srgb, var(--ui-bg) 76%, var(--color-carbon-950) 24%);
  --tree-node-shadow: color-mix(in srgb, black 28%, transparent 72%);
  --tree-root-shadow: color-mix(in srgb, var(--ui-primary) 18%, transparent 82%);
  --tree-node-border-highlight: color-mix(in srgb, white 14%, transparent 86%);
  --tree-avatar-bg: color-mix(in srgb, white 10%, transparent 90%);
  --tree-avatar-text: color-mix(in srgb, white 88%, var(--ui-primary) 12%);
  --tree-badge-bg: color-mix(in srgb, var(--ui-primary) 12%, transparent 88%);
  --tree-badge-border: color-mix(in srgb, var(--ui-primary) 28%, transparent 72%);
  --tree-badge-text: color-mix(in srgb, white 82%, var(--ui-primary) 18%);
  --tree-lineage-color: var(--color-tree-lineage);
  --tree-partner-color: var(--color-tree-partner);
  background: color-mix(in srgb, var(--ui-bg) 90%, black 10%);
  cursor: grab;
}

.tree-canvas--dragging {
  cursor: grabbing;
}

.tree-canvas__grid {
  background:
    linear-gradient(to right, var(--color-tree-grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--color-tree-grid-line) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.28;
}

.tree-canvas__scene {
  transform-origin: top left;
  will-change: transform;
}

.tree-canvas__partner-child-action-anchor,
.tree-canvas__node-action-anchor {
  position: absolute;
  z-index: 4;
}

.tree-canvas__node-action-anchor--top-left {
  transform: translate(0, calc(-100% - 8px));
}

.tree-canvas__node-action-anchor--top-right {
  transform: translate(-100%, calc(-100% - 8px));
}

.tree-canvas__node-action-anchor--bottom-left {
  transform: translate(0, 8px);
}

.tree-canvas__partner-child-action-anchor {
  position: absolute;
  z-index: 4;
  transform: translate(-50%, -50%);
}

.tree-canvas__node-action,
.tree-canvas__partner-child-action {
  box-shadow: none;
}

.tree-canvas__controls {
  box-shadow: 0 20px 40px color-mix(in srgb, black 20%, transparent 80%);
}

.tree-canvas__summary {
  box-shadow: 0 20px 40px color-mix(in srgb, black 16%, transparent 84%);
}

.tree-canvas__loading {
  background: color-mix(in srgb, var(--ui-bg) 70%, transparent 30%);
}
</style>
