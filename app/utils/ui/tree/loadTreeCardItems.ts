import type TreeDTO from '~/services/familytree/dtos/inner/TreeDTO'
import sendGetTreeAvatarRequest from '~/services/photos/getTreeAvatar'
import mapTreeToTreeCardItem, { getTreeCardId, type TreeCardItem } from '~/utils/ui/tree/mapTreeToTreeCardItem'
import type CustomTreeDTO from '~/services/customTrees/dtos/inner/CustomTreeDTO'
import { mapCustomTreeToTreeCardItem } from '~/utils/ui/tree/mapTreeToTreeCardItem'

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

export async function loadCustomTreeCardItems(trees: CustomTreeDTO[]): Promise<TreeCardItem[]> {
  return trees.map(mapCustomTreeToTreeCardItem)
}
