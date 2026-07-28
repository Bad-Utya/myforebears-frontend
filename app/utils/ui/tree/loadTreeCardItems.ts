import type TreeDTO from '~/services/familytree/dtos/inner/TreeDTO'
import sendGetTreeAvatarRequest from '~/services/photos/getTreeAvatar'
import mapTreeToTreeCardItem, { getTreeCardId, type TreeCardItem } from '~/utils/ui/tree/mapTreeToTreeCardItem'
import type CustomTreeDTO from '~/services/customTrees/dtos/inner/CustomTreeDTO'
import { mapCustomTreeToTreeCardItem } from '~/utils/ui/tree/mapTreeToTreeCardItem'
import sendGetUserInfoRequest from '~/services/users/getUserInfo'

const customTreeAuthorRequests = new Map<number, Promise<string | undefined>>()

function loadCustomTreeAuthor(creatorId: number) {
  const cachedRequest = customTreeAuthorRequests.get(creatorId)
  if (cachedRequest) return cachedRequest

  const request = sendGetUserInfoRequest(creatorId)
    .then(response => response.data?.user?.nickname?.trim() || undefined)
    .catch(() => {
      customTreeAuthorRequests.delete(creatorId)
      return undefined
    })

  customTreeAuthorRequests.set(creatorId, request)
  return request
}

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
  return await Promise.all(trees.map(async (tree, index) => {
    const item = mapCustomTreeToTreeCardItem(tree, index)

    if (!item.author && tree.creator_id) {
      item.author = await loadCustomTreeAuthor(tree.creator_id)
    }

    return item
  }))
}
