import { ref, watch } from 'vue'
import { sendSearchPublicTreesRequest } from '~/services/familytree/searchTrees'
import type { TreeCardItem } from '~/utils/ui/tree/mapTreeToTreeCardItem'
import { loadTreeCardItems, revokeTreeCardItems } from '~/utils/ui/tree/loadTreeCardItems'
import { useI18n } from 'vue-i18n'
import type { ListTreesResponse } from '~/services/familytree/dtos/responses/ListTreesResponse'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import type DataDTO from "~/services/api/dtos/DataDTO";

export function useFeedSearchTrees() {
  const { t } = useI18n()
  const query = ref('')
  const results = ref<TreeCardItem[]>([])
  const loading = ref(false)

  let lastItems: TreeCardItem[] = []

  const doSearch = async (q: string) => {
    if (!q || q.length < 2) {
      revokeTreeCardItems(results.value)
      results.value = []
      return
    }

    loading.value = true
    try {
      const response = await sendSearchPublicTreesRequest(q, 12) as DataDTO<ListTreesResponse>
      const trees = Array.isArray(response.data?.trees) ? response.data.trees : []
      revokeTreeCardItems(lastItems)
      lastItems = await loadTreeCardItems(trees)
      results.value = lastItems
    } catch (err) {
      showApiErrorToast(err)
      results.value = []
    } finally {
      loading.value = false
    }
  }

  // Отчистка после unmount
  const cleanup = () => {
    revokeTreeCardItems(lastItems)
  }

  return { query, results, loading, cleanup, doSearch }
}
