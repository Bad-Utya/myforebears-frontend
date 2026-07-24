import { sendSearchPublicUsersRequest } from "~/services/users/searchUsers";
import { sendSearchPublicTreesRequest } from "~/services/familytree/searchTrees";

export const useSearchTreeFast = () => {
  async function search(query: string) {
    // Если запрос пустой, возвращаем пустые группы, чтобы палитра не висела
    if (!query || query.length < 2) return []

    const [usersResult, treesResult] = await Promise.allSettled([
      sendSearchPublicUsersRequest(query, 5),
      sendSearchPublicTreesRequest(query, 5)
    ])

    const groups = []

    // Обработка деревьев
    if (treesResult.status === 'fulfilled' && treesResult.value.data?.trees?.length) {
      groups.push({
        id: 'trees',
        label: 'Public trees',
        items: treesResult.value.data.trees.map((tree: any) => ({
          id: `tree-${tree.id}`,
          label: tree.name,
          suffix: 'Family tree',
          to: `/tree/${tree.id}/main`,
          icon: 'i-lucide-network'
        }))
      })
    }

    // Обработка пользователей
    if (usersResult.status === 'fulfilled' && usersResult.value.data?.users?.length) {
      groups.push({
        id: 'users',
        label: 'Users',
        items: usersResult.value.data.users.map((user: any) => ({
          id: `user-${user.id}`,
          label: user.nickname,
          suffix: user.email,
          to: `/users/${user.nickname}`,
          icon: 'i-lucide-user',
          avatar: {
            src: user.id ? `/api/photos/users/${user.id}/avatar` : undefined,
            alt: user.nickname,
            size: '2xs'
          }
        }))
      })
    }

    return groups
  }

  return { search }
}
