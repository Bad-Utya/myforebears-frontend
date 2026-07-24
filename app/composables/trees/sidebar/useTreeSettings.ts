import type TreeDTO from '~/services/familytree/dtos/inner/TreeDTO'
import sendUpdateTreeSettingsRequest from '~/services/familytree/updateTreeSettings'
import sendUploadTreeAvatarRequest from '~/services/photos/uploadTreeAvatar'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

export function useTreeSettings() {
  const toast = useToast()
  const isSaving = ref(false)

  async function updateTree(treeId: string, payload: {
    name: string,
    description: string,
    isPublic: boolean,
    isRestricted: boolean,
    avatar: File | null
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

      if (payload.avatar) {
        await sendUploadTreeAvatarRequest(treeId, payload.avatar)
      }

      toast.add({ title: 'Tree settings updated', color: 'success' })
      return response.data?.tree ?? null
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
