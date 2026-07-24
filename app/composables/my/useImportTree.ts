import sendImportGedcomRequest from '~/services/familytree/importGedcom'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

export function useImportTree(onSuccess?: (treeId: string) => void) {
  const toast = useToast()
  const pending = ref(false)
  const gedcomFile = ref<File | null>(null)

  const isImportDisabled = computed(() => pending.value || !gedcomFile.value)

  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (file) gedcomFile.value = file
  }

  async function importTree() {
    if (!gedcomFile.value) return

    pending.value = true
    try {
      const content = await gedcomFile.value.text()
      const response = await sendImportGedcomRequest(content)
      const treeId = response.data?.tree?.id || response.data?.tree?.tree_id

      toast.add({
        title: 'Success',
        description: 'Family tree imported successfully',
        color: 'success'
      })

      if (treeId && onSuccess) onSuccess(treeId)
    } catch (error) {
      showApiErrorToast(error)
    } finally {
      pending.value = false
    }
  }

  return {
    gedcomFile,
    pending,
    isImportDisabled,
    handleFileSelect,
    importTree
  }
}
