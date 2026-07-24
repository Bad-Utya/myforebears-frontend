import { toValue } from 'vue'
import type DataDTO from '~/services/api/dtos/DataDTO'
import sendImportPublicPersonRequest from '~/services/publicPersons/importPublicPerson'
import sendListRandomPublicPersonsRequest from '~/services/publicPersons/listRandomPublicPersons'
import sendSearchPublicPersonsRequest from '~/services/publicPersons/searchPublicPersons'
import type { ListPublicPersonsResponse } from '~/services/publicPersons/dtos/responses/ListPublicPersonsResponse'
import {
  loadPublicPersonCardItems,
  revokePublicPersonCardItems
} from '~/utils/ui/publicPersons/loadPublicPersonCardItems'
import type { PublicPersonCardItem } from '~/utils/ui/publicPersons/mapPublicPersonToCardItem'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

export type PublicPersonAttachment = 'CHILD' | 'PARTNER' | 'FATHER' | 'MOTHER'

export function usePublicPersonBrowser(
  treeId: MaybeRefOrGetter<string | undefined>,
  attachToPersonId: MaybeRefOrGetter<string | undefined>,
  attachment: MaybeRefOrGetter<PublicPersonAttachment | undefined>,
  tags: MaybeRefOrGetter<string[] | undefined> = []
) {
  const query = ref('')
  const items = ref<PublicPersonCardItem[]>([])
  const loading = ref(false)
  const importingId = ref<string | null>(null)

  async function loadPersons() {
    loading.value = true

    try {
      const trimmedQuery = query.value.trim()
      const selectedTags = toValue(tags) ?? []
      const response = (trimmedQuery.length >= 2
        ? await sendSearchPublicPersonsRequest({
            q: trimmedQuery,
            limit: 20,
            tags: selectedTags
          })
        : selectedTags.length
          ? await sendSearchPublicPersonsRequest({
              q: '',
              limit: 20,
              tags: selectedTags
            })
          : await sendListRandomPublicPersonsRequest(20)) as DataDTO<ListPublicPersonsResponse>

      const persons = Array.isArray(response.data?.persons) ? response.data.persons : []
      revokePublicPersonCardItems(items.value)
      items.value = await loadPublicPersonCardItems(persons)
    } catch (error) {
      showApiErrorToast(error)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function importPerson(item: PublicPersonCardItem) {
    const resolvedTreeId = toValue(treeId)
    const resolvedAttachToPersonId = toValue(attachToPersonId)
    const resolvedAttachment = toValue(attachment)

    if (!resolvedTreeId || !resolvedAttachment) {
      return null
    }

    importingId.value = item.id

    try {
      const response = await sendImportPublicPersonRequest(
        item.id,
        resolvedTreeId,
        resolvedAttachment,
        resolvedAttachToPersonId
      )

      return response.data?.person ?? null
    } catch (error) {
      showApiErrorToast(error)
      return null
    } finally {
      importingId.value = null
    }
  }

  function cleanup() {
    revokePublicPersonCardItems(items.value)
  }

  return {
    query,
    items,
    loading,
    importingId,
    loadPersons,
    importPerson,
    cleanup
  }
}
