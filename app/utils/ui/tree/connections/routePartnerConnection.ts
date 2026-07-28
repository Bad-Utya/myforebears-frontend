import type { TreeVisualConnection } from '~/utils/ui/tree/coordinates/computeConnections'
import type { TreeVisualNode } from '~/utils/ui/tree/coordinates/computeNodes'

const SAME_LAYER_TOLERANCE = 1

type PartnerRouteOptions = {
  leftNode: TreeVisualNode
  rightNode: TreeVisualNode
  connections: TreeVisualConnection[]
  nodeMap: Map<string, TreeVisualNode>
  layerGap: number
}

function getCenterX(node: TreeVisualNode) {
  return node.x + node.width / 2
}

function getNodesBetweenPartners(
  leftNode: TreeVisualNode,
  rightNode: TreeVisualNode,
  nodeMap: Map<string, TreeVisualNode>
) {
  const leftCenterX = getCenterX(leftNode)
  const rightCenterX = getCenterX(rightNode)

  return [...nodeMap.values()]
    .filter(node =>
      node.id !== leftNode.id
      && node.id !== rightNode.id
      && Math.abs(node.y - leftNode.y) <= SAME_LAYER_TOLERANCE
      && getCenterX(node) > leftCenterX
      && getCenterX(node) < rightCenterX
    )
    .sort((left, right) => left.x - right.x)
}

function findHighestAncestor(
  initialNodes: TreeVisualNode[],
  connections: TreeVisualConnection[],
  nodeMap: Map<string, TreeVisualNode>
) {
  const parentIdsByChildId = new Map<string, string[]>()

  for (const connection of connections) {
    if (connection.type !== 'RELATIONSHIP_PARENT_CHILD') continue

    const parentIds = parentIdsByChildId.get(connection.toId) ?? []
    parentIds.push(connection.fromId)
    parentIdsByChildId.set(connection.toId, parentIds)
  }

  const queue = initialNodes.map(node => node.id)
  const visited = new Set<string>()
  let highestNode = initialNodes[0]

  while (queue.length > 0) {
    const nodeId = queue.shift()
    if (!nodeId || visited.has(nodeId)) continue

    visited.add(nodeId)
    const node = nodeMap.get(nodeId)

    if (node && (!highestNode || node.y < highestNode.y)) {
      highestNode = node
    }

    for (const parentId of parentIdsByChildId.get(nodeId) ?? []) {
      if (!visited.has(parentId) && nodeMap.has(parentId)) {
        queue.push(parentId)
      }
    }
  }

  return highestNode
}

export function getPartnerConnectionRoute({
  leftNode,
  rightNode,
  connections,
  nodeMap,
  layerGap
}: PartnerRouteOptions) {
  const intermediateNodes = getNodesBetweenPartners(leftNode, rightNode, nodeMap)

  if (intermediateNodes.length === 0) {
    return null
  }

  const firstIntermediateNode = intermediateNodes[0]!
  const lastIntermediateNode = intermediateNodes.at(-1)!
  const highestNode = findHighestAncestor(intermediateNodes, connections, nodeMap)

  if (!highestNode) {
    return null
  }

  const startX = leftNode.x + leftNode.width
  const startY = leftNode.y + leftNode.height / 2
  const endX = rightNode.x
  const endY = rightNode.y + rightNode.height / 2
  const startColumnX = (startX + firstIntermediateNode.x) / 2
  const endColumnX = (lastIntermediateNode.x + lastIntermediateNode.width + endX) / 2
  const verticalLayerGap = Math.max(0, layerGap - highestNode.height)
  const routeY = highestNode.y - verticalLayerGap / 2

  const path = [
    `M ${startX} ${startY}`,
    `L ${startColumnX} ${startY}`,
    `L ${startColumnX} ${routeY}`,
    `L ${endColumnX} ${routeY}`,
    `L ${endColumnX} ${endY}`,
    `L ${endX} ${endY}`
  ].join(' ')

  return {
    path,
    actionX: (startColumnX + endColumnX) / 2,
    actionY: routeY
  }
}

export function routePartnerConnection(options: PartnerRouteOptions) {
  return getPartnerConnectionRoute(options)?.path ?? null
}
