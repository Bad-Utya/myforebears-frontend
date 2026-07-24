import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import type RelationshipDTO from '~/services/familytree/dtos/inner/RelationshipDTO'
import { computeFallbackNodes, type TreeVisualNode } from './computeNodes'
import { computeConnections, type TreeVisualConnection } from './computeConnections'
import {getTreePersonId} from "~/utils/ui/tree/resolveTreePersonId";

const NODE_WIDTH = 224
const NODE_HEIGHT = 80
const SCENE_PADDING = 160
const LEVEL_GAP = 176
const COLUMN_UNIT_GAP = 332 / 2

type RawVisualNode = {
  visualId: string
  personId: string
  x: number
  y: number
  width: number
  height: number
}

export function getLayersGap() {
  return LEVEL_GAP;
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

function extractPersonIdFromPeople(people: unknown) {
  if (!Array.isArray(people)) return undefined

  for (const p of people) {
    if (typeof p === 'string') return p
    if (!isRecord(p)) continue

    const id =
      getString(p.person_id) ??
      getString(p.personId) ??
      getString(p.id)

    if (id) return id
  }

  return undefined
}

function extractRawNodes(raw: unknown): RawVisualNode[] {
  if (!isRecord(raw) || !Array.isArray(raw.nodes)) return []

  return raw.nodes.flatMap((node, index) => {
    if (!isRecord(node)) return []

    const personId =
      getString(node.person_id) ??
      getString(node.personId) ??
      extractPersonIdFromPeople(node.people)

    const x = getNumber(node.x)
    const y = getNumber(node.y)

    if (!personId || Number.isNaN(x) || Number.isNaN(y)) return []

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

function getFallbackNodes(persons: PersonDTO[], relationships: RelationshipDTO[], rootPersonId?: string) {
  const nodes = computeFallbackNodes(persons, relationships, rootPersonId)

  return {
    nodes,
    connections: computeConnections(undefined, relationships),
    width: Math.max(...nodes.map(node => node.x + node.width)) + SCENE_PADDING,
    height: Math.max(...nodes.map(node => node.y + node.height)) + SCENE_PADDING
  }
}

export default function adaptTreeVisualization(
  rawVisualisation: unknown,
  persons: PersonDTO[],
  relationships: RelationshipDTO[],
  rootPersonId?: string
) {
  const personById = new Map(persons.map(person => [getTreePersonId(person), person]))
  const rawNodes = extractRawNodes(rawVisualisation)

  if (rawNodes.length === 0) {
    return getFallbackNodes(persons, relationships, rootPersonId)
  }

  const filteredNodes = rawNodes
    .map(n => {
      const person = personById.get(n.personId)
      return person ? { ...n, person } : undefined
    })
    .filter((n): n is RawVisualNode & { person: PersonDTO } => Boolean(n))

  if (filteredNodes.length === 0) {
    return getFallbackNodes(persons, relationships, rootPersonId)
  }

  const visualNodeMap = new Map(filteredNodes.map(n => [n.visualId, n]))

  const minX = Math.min(...filteredNodes.map(n => n.x))
  const minY = Math.min(...filteredNodes.map(n => n.y))
  const maxY = Math.max(...filteredNodes.map(n => n.y))

  const maxRight = isRecord(rawVisualisation) ? getNumber(rawVisualisation.maxRight) : Number.NaN
  const maxLayer = isRecord(rawVisualisation) ? getNumber(rawVisualisation.maxLayer) : Number.NaN

  const nodes: TreeVisualNode[] = filteredNodes.map(node => ({
    id: node.personId,
    person: node.person,
    x: SCENE_PADDING + (node.x - minX + 1) * COLUMN_UNIT_GAP - node.width / 2,
    y: SCENE_PADDING + (maxY - node.y) * LEVEL_GAP,
    width: node.width,
    height: node.height,
    isRoot: node.personId === rootPersonId
  }))

  const nodeIds = new Set(nodes.map(n => n.id))

  const connections: TreeVisualConnection[] = computeConnections(rawVisualisation, relationships, visualNodeMap)
    .filter(c => nodeIds.has(c.fromId) && nodeIds.has(c.toId))
    .map(c => ({
      ...c,
      fromX: c.fromX != null
        ? SCENE_PADDING + (c.fromX - minX) * COLUMN_UNIT_GAP
        : undefined,
      toX: c.toX != null
        ? SCENE_PADDING + (c.toX - minX) * COLUMN_UNIT_GAP
        : undefined,
      fromY: c.fromY != null
        ? SCENE_PADDING + (maxY - c.fromY) * LEVEL_GAP + NODE_HEIGHT / 2
        : undefined,
      toY: c.toY != null
        ? SCENE_PADDING + (maxY - c.toY) * LEVEL_GAP + NODE_HEIGHT / 2
        : undefined
    }))

  const sceneWidthFromNodes = Math.max(...nodes.map(n => n.x + n.width)) + SCENE_PADDING
  const sceneHeightFromNodes = Math.max(...nodes.map(n => n.y + n.height)) + SCENE_PADDING

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
