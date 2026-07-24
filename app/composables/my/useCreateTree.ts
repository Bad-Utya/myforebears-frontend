// composables/useCreateTree.ts
import ApiRequestError from '~/services/api/ApiRequestError'
import sendCreateTreeRequest from '~/services/familytree/createTree'
import sendUploadTreeAvatarRequest from '~/services/photos/uploadTreeAvatar'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

export function useCreateTree(onSuccess?: (treeId: string) => void) {
  const toast = useToast()

  const pending = ref(false)
  const treeName = ref('')
  const treeDescription = ref('')

  const avatarFileInput = ref<HTMLInputElement | null>(null)
  const avatarCropper = ref<{ exportFile: (fileName?: string, size?: number) => Promise<File> } | null>(null)
  const avatarSourceUrl = ref<string | null>(null)

  const isSubmitDisabled = computed(() => pending.value || !treeName.value.trim())

  function revokeAvatarSourceUrl() {
    if (avatarSourceUrl.value?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarSourceUrl.value)
    }
  }

  function resetAvatarEditor() {
    revokeAvatarSourceUrl()
    avatarSourceUrl.value = null
    if (avatarFileInput.value) avatarFileInput.value.value = ''
  }

  function resetForm() {
    treeName.value = ''
    treeDescription.value = ''
    resetAvatarEditor()
  }

  async function handleAvatarFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.add({ title: 'Please choose an image file', color: 'error' })
      input.value = ''
      return
    }

    revokeAvatarSourceUrl()
    avatarSourceUrl.value = URL.createObjectURL(file)
  }

  async function createTree() {
    pending.value = true
    try {
      const response = await sendCreateTreeRequest(
        treeName.value.trim(),
        treeDescription.value.trim() || undefined
      )
      const createdTree = response.data?.tree
      const treeId = createdTree?.id ?? createdTree?.tree_id

      if (!treeId) throw new ApiRequestError('tree_not_found', 'Created tree id is missing')

      const avatarFile = await avatarCropper.value?.exportFile('tree-avatar.png', 512)

      if (avatarFile) {
        await sendUploadTreeAvatarRequest(treeId, avatarFile)
      }

      toast.add({
        title: 'Tree created',
        description: 'A new family tree was added to your collection.',
        color: 'success'
      })

      if (onSuccess) onSuccess(treeId)
      return treeId
    } catch (error) {
      showApiErrorToast(error)
    } finally {
      pending.value = false
    }
  }

  return {
    treeName,
    treeDescription,
    pending,
    avatarSourceUrl,
    avatarFileInput,
    avatarCropper,
    isSubmitDisabled,
    createTree,
    handleAvatarFileChange,
    resetForm,
    resetAvatarEditor
  }
}
