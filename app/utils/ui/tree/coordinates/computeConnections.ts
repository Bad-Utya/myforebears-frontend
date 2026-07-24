import type RelationshipDTO from '~/services/familytree/dtos/inner/RelationshipDTO'

export type TreeVisualConnection = {
  id: string
  fromId: string
  toId: string
  type: string
  fromX?: number
  fromY?: number
  toX?: number
  toY?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getNumber(value: unknown, fallback = Number.NaN) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function normalizeRelationshipType(value: unknown) {
  const normalizedValue = getString(value)?.trim().toLowerCase()

  if (normalizedValue === 'partner' || normalizedValue === 'relationship_partner') {
    return 'RELATIONSHIP_PARTNER'
  }

  if (normalizedValue === 'parent-child' || normalizedValue === 'relationship_parent_child') {
    return 'RELATIONSHIP_PARENT_CHILD'
  }

  return getString(value) ?? 'RELATIONSHIP_TYPE_UNSPECIFIED'
}

export function computeConnections(
  raw: unknown,
  relationships: RelationshipDTO[],
  visualNodeMap?: Map<string, any>
): TreeVisualConnection[] {
  if (isRecord(raw) && Array.isArray(raw.edges) && visualNodeMap) {
    const connections = raw.edges.flatMap((edge, index) => {
      if (!isRecord(edge)) return []

      const fromVisualId = String(getNumber(edge.fromNodeIdx, index))
      const toVisualId = String(getNumber(edge.toNodeIdx, index))
      const fromNode = visualNodeMap.get(fromVisualId)
      const toNode = visualNodeMap.get(toVisualId)

      if (!fromNode || !toNode) return []

      return [{
        id: `${fromNode.personId}-${toNode.personId}-${index}`,
        fromId: fromNode.personId,
        toId: toNode.personId,
        type: normalizeRelationshipType(edge.edgeType ?? edge.type),
        fromX: getNumber(edge.fromX),
        fromY: getNumber(edge.fromY),
        toX: getNumber(edge.toX),
        toY: getNumber(edge.toY)
      }]
    })

    if (connections.length > 0) return connections
  }

  return relationships
    .filter(r => r.person_id_from && r.person_id_to)
    .map((r, index) => ({
      id: `${r.person_id_from}-${r.person_id_to}-${index}`,
      fromId: r.person_id_from!,
      toId: r.person_id_to!,
      type: normalizeRelationshipType(r.type)
    }))
}
