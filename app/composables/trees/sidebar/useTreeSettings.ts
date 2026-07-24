import sendUpdateTreeSettingsRequest from '~/services/familytree/updateTreeSettings'
import sendUploadTreeAvatarRequest from '~/services/photos/uploadTreeAvatar'
import sendReplaceFamilyTreeTagsRequest from '~/services/tags/replaceFamilyTreeTags'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

export function useTreeSettings() {
  const toast = useToast()
  const isSaving = ref(false)

  async function updateTree(treeId: string, payload: {
    name: string
    description: string
    isPublic: boolean
    isRestricted: boolean
    avatar: File | null
    tagCodes: string[]
  }) {
    if (isSaving.value || !treeId) return null
    isSaving.value = true

    try {
      const response = await sendUpdateTreeSettingsRequest(
        treeId,
        payload.isPublic,
        payload.isRestricted,
        payload.name.trim() || undefined,
        payload.description.trim() || undefined
      )
      let updatedTree = response.data?.tree ?? null

      const tagsResponse = await sendReplaceFamilyTreeTagsRequest(treeId, payload.tagCodes)
      updatedTree = tagsResponse.data?.tree ?? updatedTree

      if (payload.avatar) {
        await sendUploadTreeAvatarRequest(treeId, payload.avatar)
      }

      toast.add({ title: 'Tree settings updated', color: 'success' })
      return updatedTree
    } catch (error) {
      showApiErrorToast(error)
      return null
    } finally {
      isSaving.value = false
    }
  }

  return {
    isSaving,
    updateTree
  }
}
