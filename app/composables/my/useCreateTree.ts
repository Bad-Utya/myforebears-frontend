// composables/useCreateTree.ts
import ApiRequestError from '~/services/api/ApiRequestError'
import sendCreateTreeRequest from '~/services/familytree/createTree'
import sendUploadTreeAvatarRequest from '~/services/photos/uploadTreeAvatar'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import sendCreateCustomTreeRequest from '~/services/customTrees/createCustomTree'

export type NewTreeKind = 'family' | 'custom'

export function useCreateTree(onSuccess?: (treeId: string, kind: NewTreeKind) => void) {
  const toast = useToast()

  const pending = ref(false)
  const treeName = ref('')
  const treeDescription = ref('')
  const treeKind = ref<NewTreeKind>('family')
  const relationUp = ref('')
  const relationDown = ref('')

  const avatarFileInput = ref<HTMLInputElement | null>(null)
  const avatarCropper = ref<{ exportFile: (fileName?: string, size?: number) => Promise<File> } | null>(null)
  const avatarSourceUrl = ref<string | null>(null)

  const isSubmitDisabled = computed(() => pending.value || !treeName.value.trim()
    || (treeKind.value === 'custom' && (!relationUp.value.trim() || !relationDown.value.trim())))

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
    treeKind.value = 'family'
    relationUp.value = ''
    relationDown.value = ''
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
      const response = treeKind.value === 'custom'
        ? await sendCreateCustomTreeRequest(
            treeName.value.trim(), treeDescription.value.trim() || undefined,
            treeName.value.trim(), relationUp.value.trim(), relationDown.value.trim()
          )
        : await sendCreateTreeRequest(treeName.value.trim(), treeDescription.value.trim() || undefined)
      const createdTree = response.data?.tree
      const treeId = createdTree?.id
        ?? (createdTree && 'tree_id' in createdTree ? createdTree.tree_id : undefined)

      if (!treeId) throw new ApiRequestError('tree_not_found', 'Created tree id is missing')

      const avatarFile = await avatarCropper.value?.exportFile('tree-avatar.png', 512)

      if (avatarFile && treeKind.value === 'family') {
        await sendUploadTreeAvatarRequest(treeId, avatarFile)
      }

      toast.add({
        title: 'Tree created',
        description: treeKind.value === 'custom'
          ? 'A new custom tree was added to your collection.'
          : 'A new family tree was added to your collection.',
        color: 'success'
      })

      if (onSuccess) onSuccess(treeId, treeKind.value)
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
    treeKind,
    relationUp,
    relationDown,
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
