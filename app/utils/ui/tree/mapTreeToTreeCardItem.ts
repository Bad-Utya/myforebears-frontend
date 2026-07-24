import type TreeDTO from '~/services/familytree/dtos/inner/TreeDTO'

export type TreeCardItem = {
  id: string
  title: string
  author?: string
  description?: string
  avatar: string
  coverSeed?: string
  comments?: string
  href: string
}

export function getTreeCardId(tree: TreeDTO, index: number) {
  return String(tree.id ?? tree.tree_id ?? index + 1)
}

export function getTreeCardTitle(tree: TreeDTO, index: number) {
  return tree.name ?? tree.title ?? `Tree ${index + 1}`
}

export default function mapTreeToTreeCardItem(tree: TreeDTO, index: number): TreeCardItem {
  const id = getTreeCardId(tree, index)
  const author = tree.creator_nickname?.trim()
  const description = tree.description?.trim()

  return {
    id,
    title: getTreeCardTitle(tree, index),
    author: author || undefined,
    description: description || undefined,
    avatar: '',
    coverSeed: id,
    href: `/trees/${id}/main`
  }
}
