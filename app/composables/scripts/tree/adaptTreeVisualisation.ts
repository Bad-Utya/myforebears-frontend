import type PersonDTO from '~/composables/scripts/familytree/dtos/inner/PersonDTO'
import type RelationshipDTO from '~/composables/scripts/familytree/dtos/inner/RelationshipDTO'
import { getTreePersonId } from '~/composables/scripts/tree/resolveTreeRootPersonId'

export type TreeVisualNode = {
  id: string
  person: PersonDTO
  x: number
  y: number
  width: number
  height: number
  isRoot: boolean
}

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

export type TreeVisualLayout = {
  nodes: TreeVisualNode[]
  connections: TreeVisualConnection[]
  width: number
  height: number
}

type RawVisualNode = {
  visualId: string
  personId: string
  x: number
  y: number
  width: number
  height: number
}

const NODE_WIDTH = 224
const NODE_HEIGHT = 96
const SCENE_PADDING = 160
const LEVEL_GAP = 176
const COLUMN_GAP = 284
const COLUMN_UNIT_GAP = COLUMN_GAP / 2

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

function extractPersonIdFromPeople(people: unknown) {
  if (!Array.isArray(people)) {
    return undefined
  }

  for (const person of people) {
    if (typeof person === 'string') {
      return person
    }

    if (!isRecord(person)) {
      continue
    }

    const personId = getString(person.person_id)
      ?? getString(person.personId)
      ?? getString(person.id)

    if (personId) {
      return personId
    }
  }

  return undefined
}

function extractRawNodes(raw: unknown) {
  if (!isRecord(raw) || !Array.isArray(raw.nodes)) {
    return [] as RawVisualNode[]
  }

  return raw.nodes.flatMap((node, index) => {
    if (!isRecord(node)) {
      return []
    }

    const personId = getString(node.person_id)
      ?? getString(node.personId)
      ?? extractPersonIdFromPeople(node.people)
    const x = getNumber(node.x)
    const y = getNumber(node.y)

    if (!personId || Number.isNaN(x) || Number.isNaN(y)) {
      return []
    }

    return [{
      visualId: String(getString(node.id) ?? getNumber(node.id, index) ?? index),
      personId,
      x,
      y,
      width: getNumber(node.width, getNumber(node.w, NODE_WIDTH)),
      height: getNumber(node.height, getNumber(node.h, NODE_HEIGHT))
    }]
  })
}

function buildConnections(
  raw: unknown,
  relationships: RelationshipDTO[],
  visualNodeMap?: Map<string, RawVisualNode>
): TreeVisualConnection[] {
  if (isRecord(raw) && Array.isArray(raw.edges) && visualNodeMap) {
    const connections = raw.edges.flatMap((edge, index) => {
      if (!isRecord(edge)) {
        return []
      }

      const fromVisualId = String(getNumber(edge.fromNodeIdx, index))
      const toVisualId = String(getNumber(edge.toNodeIdx, index))
      const fromNode = visualNodeMap.get(fromVisualId)
      const toNode = visualNodeMap.get(toVisualId)

      if (!fromNode || !toNode) {
        return []
      }

      return [{
        id: `${fromNode.personId}-${toNode.personId}-${index}`,
        fromId: fromNode.personId,
        toId: toNode.personId,
        type: normalizeRelationshipType(edge.edgeType ?? edge.type),
        fromX: getNumber(edge.fromX),
        fromY: getNumber(edge.fromY),
        toX: getNumber(edge.toX),
        toY: getNumber(edge.toY)
      } satisfies TreeVisualConnection]
    })

    if (connections.length > 0) {
      return connections
    }
  }

  return relationships
    .filter(relationship => relationship.person_id_from && relationship.person_id_to)
    .map((relationship, index) => ({
      id: `${relationship.person_id_from ?? 'from'}-${relationship.person_id_to ?? 'to'}-${index}`,
      fromId: relationship.person_id_from ?? '',
      toId: relationship.person_id_to ?? '',
      type: normalizeRelationshipType(relationship.type)
    }) satisfies TreeVisualConnection)
}

function buildLevelMap(rootPersonId: string, relationships: RelationshipDTO[]) {
  const adjacency = new Map<string, Set<string>>()

  for (const relationship of relationships) {
    const fromId = relationship.person_id_from
    const toId = relationship.person_id_to

    if (!fromId || !toId) {
      continue
    }

    if (!adjacency.has(fromId)) {
      adjacency.set(fromId, new Set())
    }

    if (!adjacency.has(toId)) {
      adjacency.set(toId, new Set())
    }

    adjacency.get(fromId)?.add(toId)
    adjacency.get(toId)?.add(fromId)
  }

  const levels = new Map<string, number>([[rootPersonId, 0]])
  const queue = [rootPersonId]

  while (queue.length > 0) {
    const currentId = queue.shift()

    if (!currentId) {
      continue
    }

    const currentLevel = levels.get(currentId) ?? 0

    for (const nextId of adjacency.get(currentId) ?? []) {
      if (levels.has(nextId)) {
        continue
      }

      levels.set(nextId, currentLevel + 1)
      queue.push(nextId)
    }
  }

  return levels
}

export function buildFallbackTreeLayout(
  persons: PersonDTO[],
  relationships: RelationshipDTO[],
  rootPersonId?: string
): TreeVisualLayout {
  const normalizedPersons = persons
    .map(person => ({
      id: getTreePersonId(person),
      person
    }))
    .filter((person): person is { id: string, person: PersonDTO } => Boolean(person.id))

  if (normalizedPersons.length === 0) {
    return {
      nodes: [],
      connections: [],
      width: SCENE_PADDING * 2,
      height: SCENE_PADDING * 2
    }
  }

  const safeRootPersonId = rootPersonId ?? normalizedPersons[0]?.id ?? ''
  const levels = buildLevelMap(safeRootPersonId, relationships)
  const groupedByLevel = new Map<number, typeof normalizedPersons>()

  for (const normalizedPerson of normalizedPersons) {
    const level = levels.get(normalizedPerson.id) ?? 0

    if (!groupedByLevel.has(level)) {
      groupedByLevel.set(level, [])
    }

    groupedByLevel.get(level)?.push(normalizedPerson)
  }

  const sortedLevels = [...groupedByLevel.keys()].sort((left, right) => left - right)
  const nodes: TreeVisualNode[] = []

  for (const level of sortedLevels) {
    const levelPersons = groupedByLevel.get(level) ?? []

    levelPersons.forEach((normalizedPerson, index) => {
      nodes.push({
        id: normalizedPerson.id,
        person: normalizedPerson.person,
        x: SCENE_PADDING + index * COLUMN_GAP,
        y: SCENE_PADDING + level * LEVEL_GAP,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        isRoot: normalizedPerson.id === safeRootPersonId
      })
    })
  }

  return {
    nodes,
    connections: buildConnections(undefined, relationships),
    width: Math.max(...nodes.map(node => node.x + node.width)) + SCENE_PADDING,
    height: Math.max(...nodes.map(node => node.y + node.height)) + SCENE_PADDING
  }
}

export default function adaptTreeVisualisation(
  rawVisualisation: unknown,
  persons: PersonDTO[],
  relationships: RelationshipDTO[],
  rootPersonId?: string
): TreeVisualLayout {
  const personById = new Map(persons.map(person => [getTreePersonId(person), person]))
  const rawNodes = extractRawNodes(rawVisualisation)

  if (rawNodes.length === 0) {
    return buildFallbackTreeLayout(persons, relationships, rootPersonId)
  }

  const filteredNodes = rawNodes
    .map((rawNode) => {
      const person = personById.get(rawNode.personId)

      if (!person) {
        return undefined
      }

      return {
        ...rawNode,
        person
      }
    })
    .filter((rawNode): rawNode is RawVisualNode & { person: PersonDTO } => Boolean(rawNode))

  if (filteredNodes.length === 0) {
    return buildFallbackTreeLayout(persons, relationships, rootPersonId)
  }

  const visualNodeMap = new Map(filteredNodes.map(node => [node.visualId, node]))
  const minX = Math.min(...filteredNodes.map(node => node.x))
  const minY = Math.min(...filteredNodes.map(node => node.y))
  const maxY = Math.max(...filteredNodes.map(node => node.y))
  const maxRight = isRecord(rawVisualisation) ? getNumber(rawVisualisation.maxRight) : Number.NaN
  const maxLayer = isRecord(rawVisualisation) ? getNumber(rawVisualisation.maxLayer) : Number.NaN

  const nodes = filteredNodes.map(node => ({
    id: node.personId,
    person: node.person,
    x: SCENE_PADDING + (node.x - minX + 1) * COLUMN_UNIT_GAP - node.width / 2,
    y: SCENE_PADDING + (maxY - node.y) * LEVEL_GAP,
    width: node.width,
    height: node.height,
    isRoot: node.personId === rootPersonId
  }))
  const nodeIds = new Set(nodes.map(node => node.id))
  const connections = buildConnections(rawVisualisation, relationships, visualNodeMap)
    .filter(connection => nodeIds.has(connection.fromId) && nodeIds.has(connection.toId))
    .map((connection) => ({
      ...connection,
      fromX: Number.isNaN(connection.fromX ?? Number.NaN)
        ? undefined
        : SCENE_PADDING + ((connection.fromX ?? 0) - minX) * COLUMN_UNIT_GAP,
      toX: Number.isNaN(connection.toX ?? Number.NaN)
        ? undefined
        : SCENE_PADDING + ((connection.toX ?? 0) - minX) * COLUMN_UNIT_GAP,
      fromY: Number.isNaN(connection.fromY ?? Number.NaN)
        ? undefined
        : SCENE_PADDING + (maxY - (connection.fromY ?? 0)) * LEVEL_GAP + NODE_HEIGHT / 2,
      toY: Number.isNaN(connection.toY ?? Number.NaN)
        ? undefined
        : SCENE_PADDING + (maxY - (connection.toY ?? 0)) * LEVEL_GAP + NODE_HEIGHT / 2,
    }))

  const sceneWidthFromNodes = Math.max(...nodes.map(node => node.x + node.width)) + SCENE_PADDING
  const sceneHeightFromNodes = Math.max(...nodes.map(node => node.y + node.height)) + SCENE_PADDING
  const sceneWidthFromGrid = Number.isNaN(maxRight)
    ? sceneWidthFromNodes
    : SCENE_PADDING * 2 + (maxRight - minX) * COLUMN_UNIT_GAP + NODE_WIDTH
  const sceneHeightFromGrid = Number.isNaN(maxLayer)
    ? sceneHeightFromNodes
    : SCENE_PADDING * 2 + (maxY - minY) * LEVEL_GAP + NODE_HEIGHT

  return {
    nodes,
    connections,
    width: Math.max(sceneWidthFromNodes, sceneWidthFromGrid),
    height: Math.max(sceneHeightFromNodes, sceneHeightFromGrid)
  }
}
