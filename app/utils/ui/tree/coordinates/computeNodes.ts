import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import type RelationshipDTO from '~/services/familytree/dtos/inner/RelationshipDTO'
import { getTreePersonId } from '~/utils/ui/tree/resolveTreePersonId'

export type TreeVisualNode = {
  id: string
  person: PersonDTO
  x: number
  y: number
  width: number
  height: number
  isRoot: boolean
}

const NODE_WIDTH = 224
const NODE_HEIGHT = 80
const SCENE_PADDING = 160
const LEVEL_GAP = 176
const COLUMN_GAP = 332

function buildLevelMap(rootPersonId: string, relationships: RelationshipDTO[]) {
  const adjacency = new Map<string, Set<string>>()

  for (const r of relationships) {
    if (!r.person_id_from || !r.person_id_to) continue

    if (!adjacency.has(r.person_id_from)) adjacency.set(r.person_id_from, new Set())
    if (!adjacency.has(r.person_id_to)) adjacency.set(r.person_id_to, new Set())

    adjacency.get(r.person_id_from)!.add(r.person_id_to)
    adjacency.get(r.person_id_to)!.add(r.person_id_from)
  }

  const levels = new Map<string, number>([[rootPersonId, 0]])
  const queue = [rootPersonId]

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) continue

    const currentLevel = levels.get(current) ?? 0

    for (const next of adjacency.get(current) ?? []) {
      if (levels.has(next)) continue
      levels.set(next, currentLevel + 1)
      queue.push(next)
    }
  }

  return levels
}

export function computeFallbackNodes(
  persons: PersonDTO[],
  relationships: RelationshipDTO[],
  rootPersonId?: string
): TreeVisualNode[] {
  const normalized = persons
    .map(p => ({ id: getTreePersonId(p), person: p }))
    .filter(p => Boolean(p.id))

  if (normalized.length === 0) return []

  const safeRoot = rootPersonId ?? normalized[0]?.id ?? ''
  const levels = buildLevelMap(safeRoot, relationships)

  const grouped = new Map<number, typeof normalized>()

  for (const p of normalized) {
    const level = levels.get(p.id) ?? 0
    if (!grouped.has(level)) grouped.set(level, [])
    grouped.get(level)!.push(p)
  }

  const sortedLevels = [...grouped.keys()].sort((a, b) => a - b)

  const nodes: TreeVisualNode[] = []

  for (const level of sortedLevels) {
    const levelPersons = grouped.get(level) ?? []
    levelPersons.forEach((p, index) => {
      nodes.push({
        id: p.id,
        person: p.person,
        x: SCENE_PADDING + index * COLUMN_GAP,
        y: SCENE_PADDING + level * LEVEL_GAP,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        isRoot: p.id === safeRoot
      })
    })
  }

  return nodes
}
