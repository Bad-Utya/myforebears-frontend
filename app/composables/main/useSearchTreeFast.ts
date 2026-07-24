import { sendSearchPublicUsersRequest } from '~/services/users/searchUsers'
import { sendSearchPublicTreesRequest } from '~/services/familytree/searchTrees'
import { sendSearchPublicPersonsRequest } from '~/services/publicPersons/searchPublicPersons'
import type DataDTO from '~/services/api/dtos/DataDTO'
import type { ListTreesResponse } from '~/services/familytree/dtos/responses/ListTreesResponse'
import type { SearchUsersResponse } from '~/services/users/dtos/responses/SearchUsersResponse'
import type { ListPublicPersonsResponse } from '~/services/publicPersons/dtos/responses/ListPublicPersonsResponse'
import type UserInfoDTO from '~/services/users/dtos/inner/UserInfoDTO'
import mapPublicPersonToCardItem, { type PublicPersonCardItem } from '~/utils/ui/publicPersons/mapPublicPersonToCardItem'
import type TreeDTO from '~/services/familytree/dtos/inner/TreeDTO'

export type MainSearchTreeItem = {
  id: string
  title: string
  description?: string
  href: string
}

export type MainSearchUserItem = {
  id: string
  title: string
  description?: string
  href: string
  user: UserInfoDTO
}

export type MainSearchResults = {
  trees: MainSearchTreeItem[]
  users: MainSearchUserItem[]
  persons: PublicPersonCardItem[]
}

function mapTreeItem(tree: TreeDTO, index: number): MainSearchTreeItem {
  const treeId = String(tree.id ?? index + 1)

  return {
    id: treeId,
    title: tree.name ?? tree.title ?? treeId,
    description: tree.description,
    href: `/trees/${treeId}/main`
  }
}

function mapUserItem(user: UserInfoDTO, index: number): MainSearchUserItem {
  const userId = String(user.id ?? index + 1)

  return {
    id: userId,
    title: user.nickname ?? user.email ?? userId,
    description: user.email,
    href: `/users/${userId}`,
    user
  }
}

export const useSearchTreeFast = () => {
  async function search(query: string, limit: number = 5): Promise<MainSearchResults> {
    if (!query || query.trim().length < 2) {
      return {
        trees: [],
        users: [],
        persons: []
      }
    }

    const trimmedQuery = query.trim()

    const [usersResult, treesResult, personsResult] = await Promise.allSettled([
      sendSearchPublicUsersRequest(trimmedQuery, limit),
      sendSearchPublicTreesRequest(trimmedQuery, limit),
      sendSearchPublicPersonsRequest(trimmedQuery, limit)
    ])

    return {
      trees: treesResult.status === 'fulfilled'
        ? (Array.isArray((treesResult.value as DataDTO<ListTreesResponse>).data?.trees)
            ? treesResult.value.data?.trees?.map(mapTreeItem) ?? []
            : [])
        : [],
      users: usersResult.status === 'fulfilled'
        ? (Array.isArray((usersResult.value as DataDTO<SearchUsersResponse>).data?.users)
            ? usersResult.value.data?.users?.map(mapUserItem) ?? []
            : [])
        : [],
      persons: personsResult.status === 'fulfilled'
        ? (Array.isArray((personsResult.value as DataDTO<ListPublicPersonsResponse>).data?.persons)
            ? personsResult.value.data?.persons?.map((person, index) => mapPublicPersonToCardItem(person, index)) ?? []
            : [])
        : []
    }
  }

  return { search }
}
