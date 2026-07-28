<script setup lang="ts">
import type RelationshipDTO from '~/services/familytree/dtos/inner/RelationshipDTO'
import type { TreeVisualNode } from '~/utils/ui/tree/coordinates/computeNodes'
import type { TreeVisualConnection } from '~/utils/ui/tree/coordinates/computeConnections'
import { getLayersGap } from '~/utils/ui/tree/coordinates/adaptTreeVisualisation'
import { routePartnerConnection } from '~/utils/ui/tree/connections/routePartnerConnection'

const props = defineProps<{
  fromNode: TreeVisualNode
  toNode: TreeVisualNode
  connection: TreeVisualConnection
  connections: TreeVisualConnection[]
  relationships: RelationshipDTO[]
  nodeMap: Map<string, TreeVisualNode>
}>()

function isPartnerRelationshipType(type?: string) {
  return typeof type === 'string' && type.includes('PARTNER')
}

function isParentChildRelationshipType(type?: string) {
  return type === 'RELATIONSHIP_PARENT_CHILD'
}

function hasPartnerRelationship(leftId: string, rightId: string) {
  return props.relationships.some((relationship) => {
    if (!isPartnerRelationshipType(relationship.type)) {
      return false
    }

    return (
      (relationship.person_id_from === leftId && relationship.person_id_to === rightId)
      || (relationship.person_id_from === rightId && relationship.person_id_to === leftId)
    )
  })
}

function getPartneredParentIds(childId: string, parentId: string) {
  const parentIds = props.relationships
    .filter((relationship) => {
      return isParentChildRelationshipType(relationship.type)
        && relationship.person_id_to === childId
        && Boolean(relationship.person_id_from)
    })
    .map(relationship => relationship.person_id_from as string)

  const secondParentId = parentIds.find((candidateId) => {
    return candidateId !== parentId && hasPartnerRelationship(parentId, candidateId)
  })

  if (!secondParentId) {
    return null
  }

  return [parentId, secondParentId] as const
}

function hasVisibleParentChildEdge(parentId: string, childId: string) {
  return props.connections.some((connection) => {
    return connection.type === 'RELATIONSHIP_PARENT_CHILD'
      && connection.fromId === parentId
      && connection.toId === childId
  })
}

function getPairStartX(leftNode: TreeVisualNode, rightNode: TreeVisualNode) {
  const partnerLineStartX = leftNode.x + leftNode.width
  const partnerLineEndX = rightNode.x

  return (partnerLineStartX + partnerLineEndX) / 2
}

const isPartnerConnection = computed(() => props.connection.type.includes('PARTNER'))

const pathData = computed(() => {
  if (isPartnerConnection.value) {
    const leftNode = props.fromNode.x <= props.toNode.x ? props.fromNode : props.toNode
    const rightNode = leftNode.id === props.fromNode.id ? props.toNode : props.fromNode
    const startX = leftNode.x + leftNode.width
    const startY = leftNode.y + leftNode.height / 2
    const endX = rightNode.x
    const endY = rightNode.y + rightNode.height / 2

    const routedPath = routePartnerConnection({
      leftNode,
      rightNode,
      connections: props.connections,
      nodeMap: props.nodeMap,
      layerGap: getLayersGap()
    })

    if (routedPath) {
      return routedPath
    }

    return `M ${startX} ${startY} L ${endX} ${endY}`
  }

  const childId = props.connection.toId
  const partneredParentIds = getPartneredParentIds(childId, props.connection.fromId)

  let startX = props.connection.fromX ?? (props.fromNode.x + props.fromNode.width / 2)
  const startY = props.fromNode.y + props.fromNode.height / 2
  const endX = props.connection.toX ?? (props.toNode.x + props.toNode.width / 2)
  const endY = props.toNode.y
  const parentBottomY = props.fromNode.y + props.fromNode.height
  const midY = parentBottomY + (getLayersGap() - props.fromNode.height) / 2

  if (partneredParentIds) {
    const [, secondParentId] = partneredParentIds
    const secondParentNode = props.nodeMap.get(secondParentId)

    if (secondParentNode) {
      const leftParentNode = props.fromNode.x <= secondParentNode.x ? props.fromNode : secondParentNode
      const rightParentNode = leftParentNode.id === props.fromNode.id ? secondParentNode : props.fromNode
      const duplicateVisibleEdgeExists = hasVisibleParentChildEdge(secondParentId, childId)

      if (duplicateVisibleEdgeExists && props.fromNode.id !== leftParentNode.id) {
        return null
      }

      startX = getPairStartX(leftParentNode, rightParentNode)
    }
  }

  return `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`
})

const connectionClass = computed(() => {
  return isPartnerConnection.value
    ? 'tree-connection tree-connection--partner'
    : 'tree-connection tree-connection--family'
})
</script>

<template>
  <path
    v-if="pathData"
    :d="pathData"
    fill="none"
    :class="connectionClass"
  />
</template>

<style scoped>
.tree-connection {
  vector-effect: non-scaling-stroke;
  stroke-width: 2px;
  stroke-linecap: square;
  stroke-linejoin: miter;
}

.tree-connection--family {
  stroke: var(--tree-lineage-color);
}

.tree-connection--partner {
  stroke: var(--tree-partner-color);
  stroke-dasharray: 8 8;
}
</style>
