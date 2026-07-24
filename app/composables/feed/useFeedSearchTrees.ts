import { ref } from 'vue'
import { sendSearchPublicTreesRequest } from '~/services/familytree/searchTrees'
import type { TreeCardItem } from '~/utils/ui/tree/mapTreeToTreeCardItem'
import { loadTreeCardItems, revokeTreeCardItems, loadCustomTreeCardItems } from '~/utils/ui/tree/loadTreeCardItems'
import type { ListTreesResponse } from '~/services/familytree/dtos/responses/ListTreesResponse'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import type DataDTO from '~/services/api/dtos/DataDTO'
import { sendSearchPublicCustomTreesRequest } from '~/services/customTrees/searchPublicCustomTrees'
import type { ListCustomTreesResponse } from '~/services/customTrees/dtos/responses/ListCustomTreesResponse'

export type FeedTreeKind = 'family' | 'custom'

export function useFeedSearchTrees() {
  const query = ref('')
  const selectedTags = ref<string[]>([])
  const treeKind = ref<FeedTreeKind>('family')
  const results = ref<TreeCardItem[]>([])
  const loading = ref(false)
  const hasActiveSearch = computed(() => {
    return query.value.trim().length >= 2 || selectedTags.value.length > 0
  })

  let lastItems: TreeCardItem[] = []

  const clearResults = () => {
    revokeTreeCardItems(results.value)
    revokeTreeCardItems(lastItems)
    lastItems = []
    results.value = []
  }

  const doSearch = async (
    q: string,
    tags: string[] = selectedTags.value,
    kind: FeedTreeKind = treeKind.value
  ) => {
    const trimmedQuery = q.trim()

    if (trimmedQuery.length < 2 && tags.length === 0) {
      clearResults()
      return
    }

    if (trimmedQuery.length < 2 && tags.length > 0) {
      loading.value = true

      try {
        const response = kind === 'custom'
          ? await sendSearchPublicCustomTreesRequest({ limit: 12, tags }) as DataDTO<ListCustomTreesResponse>
          : await sendSearchPublicTreesRequest({ limit: 12, tags }) as DataDTO<ListTreesResponse>
        const trees = Array.isArray(response.data?.trees) ? response.data.trees : []
        revokeTreeCardItems(lastItems)
        lastItems = kind === 'custom'
          ? await loadCustomTreeCardItems(trees as import('~/services/customTrees/dtos/inner/CustomTreeDTO').default[])
          : await loadTreeCardItems(trees as import('~/services/familytree/dtos/inner/TreeDTO').default[])
        results.value = lastItems
      } catch (err) {
        showApiErrorToast(err)
        results.value = []
      } finally {
        loading.value = false
      }

      return
    }

    loading.value = true
    try {
      const response = kind === 'custom'
        ? await sendSearchPublicCustomTreesRequest({ q: trimmedQuery, limit: 12, tags }) as DataDTO<ListCustomTreesResponse>
        : await sendSearchPublicTreesRequest({ q: trimmedQuery, limit: 12, tags }) as DataDTO<ListTreesResponse>
      const trees = Array.isArray(response.data?.trees) ? response.data.trees : []
      revokeTreeCardItems(lastItems)
      lastItems = kind === 'custom'
        ? await loadCustomTreeCardItems(trees as import('~/services/customTrees/dtos/inner/CustomTreeDTO').default[])
        : await loadTreeCardItems(trees as import('~/services/familytree/dtos/inner/TreeDTO').default[])
      results.value = lastItems
    } catch (err) {
      showApiErrorToast(err)
      results.value = []
    } finally {
      loading.value = false
    }
  }

  const cleanup = () => {
    revokeTreeCardItems(lastItems)
  }

  return { query, selectedTags, treeKind, results, loading, hasActiveSearch, cleanup, doSearch, clearResults }
}
