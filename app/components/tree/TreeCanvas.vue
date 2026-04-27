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

const props = defineProps<{
  treeId: string
  treeName: string
  nodes: TreeVisualNode[]
  connections: TreeVisualConnection[]
  relationships: RelationshipDTO[]
  width: number
  height: number
  editable?: boolean
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
        x: node.x + node.width / 2,
        y: node.y - 20
      })
    }

    if (!hasPartner) {
      actions.push({
        id: `${node.id}-partner`,
        nodeId: node.id,
        action: 'partner',
        label: 'Partner',
        icon: 'i-lucide-heart-plus',
        x: node.x + node.width + 20,
        y: node.y + node.height / 2
      })

      actions.push({
        id: `${node.id}-child`,
        nodeId: node.id,
        action: 'child',
        label: 'Child',
        icon: 'i-lucide-baby',
        x: node.x + node.width / 2,
        y: node.y + node.height + 20
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

  scale.value = Math.max(0.34, nextScale)
  translateX.value = (viewportWidth - props.width * scale.value) / 2
  translateY.value = (viewportHeight - props.height * scale.value) / 2
}

function startDragging(event: PointerEvent) {
  const target = event.target as HTMLElement | null

  if (target?.closest('[data-tree-node="true"]')) {
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
  fitToView
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
    @pointerdown="startDragging"
  >
    <div
      class="tree-canvas__grid absolute inset-0"
      aria-hidden="true"
    />

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

    <div
      v-else
      class="absolute inset-0 flex items-center justify-center p-6"
    >
      <div class="px-6 py-5 text-center">
        <p class="text-sm text-muted">
          No tree content available for {{ treeName }}
        </p>
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
  --tree-lineage-color: color-mix(in srgb, var(--ui-primary) 54%, white 46%);
  --tree-partner-color: color-mix(in srgb, var(--ui-secondary) 58%, white 42%);
  background: color-mix(in srgb, var(--ui-bg) 90%, black 10%);
  cursor: grab;
}

.tree-canvas--dragging {
  cursor: grabbing;
}

.tree-canvas__grid {
  background: none;
}

.tree-canvas__scene {
  transform-origin: top left;
  will-change: transform;
}

.tree-canvas__partner-child-action-anchor {
  position: absolute;
  z-index: 4;
  transform: translate(-50%, -50%);
}

.tree-canvas__node-action-anchor {
  position: absolute;
  z-index: 4;
  transform: translate(-50%, -50%);
}

.tree-canvas__node-action {
  box-shadow: none;
}

.tree-canvas__partner-child-action {
  box-shadow: none;
}
</style>
