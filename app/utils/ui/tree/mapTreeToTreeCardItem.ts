import type TreeDTO from '~/services/familytree/dtos/inner/TreeDTO'
import type CustomTreeDTO from '~/services/customTrees/dtos/inner/CustomTreeDTO'

export type TreeCardItem = {
  id: string
  title: string
  author?: string
  tagsText?: string
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

function getTreeTagsText(tree: TreeDTO) {
  const tags = Array.isArray(tree.tags)
    ? tree.tags
        .map(tag => tag.name?.trim() || tag.code?.trim())
        .filter(Boolean)
    : []

  return tags.length ? tags.join(' • ') : undefined
}

export default function mapTreeToTreeCardItem(tree: TreeDTO, index: number): TreeCardItem {
  const id = getTreeCardId(tree, index)
  const author = tree.creator_nickname?.trim()
  const tagsText = getTreeTagsText(tree)
  const description = tree.description?.trim()

  return {
    id,
    title: getTreeCardTitle(tree, index),
    author: author || undefined,
    tagsText,
    description: description || undefined,
    avatar: '',
    coverSeed: id,
    href: `/trees/${id}/main`
  }
}

export function mapCustomTreeToTreeCardItem(tree: CustomTreeDTO, index: number): TreeCardItem {
  const id = String(tree.id ?? index + 1)
  const tagsText = Array.isArray(tree.tags)
    ? tree.tags.map(tag => tag.name?.trim() || tag.code?.trim()).filter(Boolean).join(' • ') || undefined
    : undefined

  return {
    id,
    title: tree.name ?? `Custom tree ${index + 1}`,
    tagsText,
    description: tree.description?.trim() || undefined,
    avatar: '',
    coverSeed: `custom-${id}`,
    href: `/custom-trees/${id}/main`
  }
}
