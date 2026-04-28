import type TreeDTO from '~/composables/scripts/familytree/dtos/inner/TreeDTO'
import sendGetTreeAvatarRequest from '~/composables/scripts/photos/getTreeAvatar'
import mapTreeToTreeCardItem, { getTreeCardId, type TreeCardItem } from '~/composables/scripts/ui/mapTreeToTreeCardItem'

export async function mapTreeToTreeCardItemWithAvatar(tree: TreeDTO, index: number): Promise<TreeCardItem> {
  const item = mapTreeToTreeCardItem(tree, index)

  try {
    const avatarBlob = await sendGetTreeAvatarRequest(getTreeCardId(tree, index))
    item.avatar = URL.createObjectURL(avatarBlob)
  } catch {
    item.avatar = ''
  }

  return item
}

export async function loadTreeCardItems(trees: TreeDTO[]): Promise<TreeCardItem[]> {
  return await Promise.all(trees.map((tree, index) => mapTreeToTreeCardItemWithAvatar(tree, index)))
}

export function revokeTreeCardItems(items: TreeCardItem[]) {
  if (typeof URL === 'undefined') {
    return
  }

  for (const item of items) {
    if (item.avatar?.startsWith('blob:')) {
      URL.revokeObjectURL(item.avatar)
    }
  }
}
