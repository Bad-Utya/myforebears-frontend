import sendListTagsRequest from '~/services/tags/listTags'
import type TagDTO from '~/services/tags/dtos/inner/TagDTO'
import type DataDTO from '~/services/api/dtos/DataDTO'
import type { ListTagsResponse } from '~/services/tags/dtos/responses/ListTagsResponse'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

export function useAvailableTags() {
  const tags = ref<TagDTO[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  async function loadTags() {
    if (loading.value || loaded.value) {
      return
    }

    loading.value = true

    try {
      const response = await sendListTagsRequest() as DataDTO<ListTagsResponse>
      tags.value = Array.isArray(response.data?.tags) ? response.data.tags : []
      loaded.value = true
    } catch (error) {
      showApiErrorToast(error)
    } finally {
      loading.value = false
    }
  }

  return {
    tags,
    loading,
    loadTags
  }
}
