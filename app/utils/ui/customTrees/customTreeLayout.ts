import type CustomCoordinateEdgeDTO from '~/services/customTrees/dtos/inner/CustomCoordinateEdgeDTO'
import type CustomCoordinateNodeDTO from '~/services/customTrees/dtos/inner/CustomCoordinateNodeDTO'
import type CustomEdgeDTO from '~/services/customTrees/dtos/inner/CustomEdgeDTO'
import type CustomEntityDTO from '~/services/customTrees/dtos/inner/CustomEntityDTO'
import type { GetCustomTreeCoordinatesResponse } from '~/services/customTrees/dtos/responses/GetCustomTreeCoordinatesResponse'

export type CustomTreeVisualNode = {
  id: string
  entity: CustomEntityDTO
  x: number
  y: number
  width: number
  height: number
  isRoot: boolean
}

export type CustomTreeVisualEdge = {
  id: string
  parentId: string
  childId: string
  labelUp?: string
  labelDown?: string
}

export type CustomTreeLayout = {
  nodes: CustomTreeVisualNode[]
  edges: CustomTreeVisualEdge[]
  width: number
  height: number
}

const NODE_WIDTH = 192
const NODE_HEIGHT = 72
const PADDING = 160
const X_GAP = 280
const Y_GAP = 152

function fallbackPositions(entities: CustomEntityDTO[], edges: CustomEdgeDTO[], rootId?: string) {
  const children = new Map<string, string[]>()
  for (const edge of edges) {
    if (!edge.parent_id || !edge.child_id) continue
    children.set(edge.parent_id, [...(children.get(edge.parent_id) ?? []), edge.child_id])
  }

  const layers = new Map<string, number>()
  const queue = rootId ? [rootId] : []
  if (rootId) layers.set(rootId, 0)
  while (queue.length) {
    const parentId = queue.shift()!
    for (const childId of children.get(parentId) ?? []) {
      if (layers.has(childId)) continue
      layers.set(childId, (layers.get(parentId) ?? 0) + 1)
      queue.push(childId)
    }
  }

  const grouped = new Map<number, string[]>()
  entities.forEach((entity) => {
    if (!entity.id) return
    const layer = layers.get(entity.id) ?? 0
    grouped.set(layer, [...(grouped.get(layer) ?? []), entity.id])
  })

  return new Map([...grouped.entries()].flatMap(([layer, ids]) => ids.map((id, index) => [id, {
    x: PADDING + index * X_GAP,
    y: PADDING + layer * Y_GAP
  }] as const)))
}

export default function adaptCustomTreeLayout(
  coordinates: GetCustomTreeCoordinatesResponse | undefined,
  entities: CustomEntityDTO[],
  edges: CustomEdgeDTO[],
  rootId?: string
): CustomTreeLayout {
  const coordinateNodes = Array.isArray(coordinates?.nodes) ? coordinates.nodes : []
  const validCoordinateNodes = coordinateNodes.filter((node): node is CustomCoordinateNodeDTO & { entity_id: string } => Boolean(node.entity_id))
  const fallback = fallbackPositions(entities, edges, rootId)
  const coordinateById = new Map(validCoordinateNodes.map(node => [node.entity_id, node]))

  const nodes = entities.flatMap((entity) => {
    if (!entity.id) return []
    const raw = coordinateById.get(entity.id)
    const fallbackPosition = fallback.get(entity.id) ?? { x: PADDING, y: PADDING }
    const x = raw?.x == null
      ? fallbackPosition.x
      : PADDING + raw.x - NODE_WIDTH / 2
    const y = raw?.y == null
      ? fallbackPosition.y
      : PADDING + raw.y - NODE_HEIGHT / 2

    return [{ id: entity.id, entity, x, y, width: NODE_WIDTH, height: NODE_HEIGHT, isRoot: entity.id === rootId }]
  })

  const coordinateEdges = Array.isArray(coordinates?.edges) ? coordinates.edges : []
  const coordinateEdgeByKey = new Map(coordinateEdges.map((edge: CustomCoordinateEdgeDTO) => [
    `${edge.parent_id}:${edge.child_id}`,
    edge
  ]))
  const allEdges = new Map<string, CustomEdgeDTO>()
  edges.forEach((edge) => {
    if (edge.parent_id && edge.child_id) allEdges.set(`${edge.parent_id}:${edge.child_id}`, edge)
  })
  coordinateEdges.forEach((edge) => {
    if (edge.parent_id && edge.child_id) allEdges.set(`${edge.parent_id}:${edge.child_id}`, edge)
  })

  const visualEdges = [...allEdges.values()].flatMap((edge, index) => {
    if (!edge.parent_id || !edge.child_id) return []
    const coordinateEdge = coordinateEdgeByKey.get(`${edge.parent_id}:${edge.child_id}`)
    return [{
      id: `${edge.parent_id}-${edge.child_id}-${index}`,
      parentId: edge.parent_id,
      childId: edge.child_id,
      labelUp: coordinateEdge?.label_up,
      labelDown: coordinateEdge?.label_down
    }]
  })

  const width = Math.max((coordinates?.width ?? 0) + PADDING * 2, 320, ...nodes.map(node => node.x + node.width + PADDING))
  const height = Math.max((coordinates?.height ?? 0) + PADDING * 2, 320, ...nodes.map(node => node.y + node.height + PADDING))
  return { nodes, edges: visualEdges, width, height }
}
