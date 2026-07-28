import {ref, computed, watch, onBeforeUnmount} from 'vue'
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import sendDeletePersonRequest from '~/services/familytree/deletePerson'
import sendUpdatePersonGenderRequest from '~/services/familytree/updatePersonGender'
import sendUpdatePersonNameRequest from '~/services/familytree/updatePersonName'
import sendGetPersonAvatarRequest from '~/services/photos/getPersonAvatar'
import sendUploadPersonAvatarRequest from '~/services/photos/uploadPersonAvatar'
import {getTreePersonId} from '~/utils/ui/tree/resolveTreePersonId'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import {sendUpdateTreeRootPersonRequest} from "~/services/familytree/updateRootPerson";

type EditableGender = 'MALE' | 'FEMALE' | null

export function usePersonEditor(props: { person: PersonDTO; treeId: string }, emit: any) {
  const toast = useToast()

  const editMode = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)

  const firstName = ref('')
  const lastName = ref('')
  const patronymic = ref('')
  const selectedGender = ref<EditableGender>(null)

  const avatarFileInput = ref<HTMLInputElement | null>(null)
  const avatarCropper = ref<any>(null)
  const avatarSourceUrl = ref<string | null>(null)
  const avatarUrl = ref<string | null>(null)
  const avatarReloadKey = ref(0)

  const personId = computed(() => getTreePersonId(props.person))
  const hasAvatar = computed(() => Boolean(props.person.avatar_photo_id) || avatarReloadKey.value > 0)

  const normalizeGender = (gender?: string): EditableGender => {
    if (gender?.includes('MALE')) return 'MALE'
    if (gender?.includes('FEMALE')) return 'FEMALE'
    return null
  }

  const syncForm = () => {
    firstName.value = props.person.first_name ?? ''
    lastName.value = props.person.last_name ?? ''
    patronymic.value = props.person.patronymic ?? ''
    selectedGender.value = normalizeGender(props.person.gender)
  }

  const revokeUrl = (url: string | null) => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
  }

  const resetAvatarEditor = () => {
    revokeUrl(avatarSourceUrl.value)
    avatarSourceUrl.value = null
    if (avatarFileInput.value) avatarFileInput.value.value = ''
  }

  const loadAvatar = async () => {
    if (!personId.value || !hasAvatar.value) {
      revokeUrl(avatarUrl.value)
      avatarUrl.value = null
      return
    }
    try {
      const blob = await sendGetPersonAvatarRequest(props.treeId, personId.value)
      const nextUrl = URL.createObjectURL(blob)
      revokeUrl(avatarUrl.value)
      avatarUrl.value = nextUrl
    } catch {
      avatarUrl.value = null
    }
  }

  const handleAvatarFileChange = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.add({title: 'Please choose an image file', color: 'error'})
      return
    }

    revokeUrl(avatarSourceUrl.value)
    avatarSourceUrl.value = URL.createObjectURL(file)
  }

  const savePerson = async () => {
    if (!personId.value) return
    isSaving.value = true
    try {
      const hasNameChanges = firstName.value !== (props.person.first_name ?? '') ||
        lastName.value !== (props.person.last_name ?? '') ||
        patronymic.value !== (props.person.patronymic ?? '')
      const hasGenderChanges = selectedGender.value !== normalizeGender(props.person.gender)

      let updatedPerson = props.person

      if (hasNameChanges) {
        const res = await sendUpdatePersonNameRequest(props.treeId, personId.value, firstName.value, lastName.value, patronymic.value)
        updatedPerson = res.data?.person ?? updatedPerson
      }
      if (hasGenderChanges && selectedGender.value) {
        const res = await sendUpdatePersonGenderRequest(props.treeId, personId.value, selectedGender.value)
        updatedPerson = res.data?.person ?? updatedPerson
      }
      if (avatarCropper.value) {
        const file = await avatarCropper.value.exportFile('avatar.png', 512)
        await sendUploadPersonAvatarRequest(props.treeId, personId.value, file)
        avatarReloadKey.value++
      }

      emit('updated', updatedPerson)
      toast.add({title: 'Person updated', color: 'success'})
      editMode.value = false
      resetAvatarEditor()
    } catch (e) {
      showApiErrorToast(e)
    } finally {
      isSaving.value = false
    }
  }

  const deletePerson = async (confirmName: string) => {
    if (!personId.value || isDeleting.value || !window.confirm(`Delete ${confirmName}?`)) return
    isDeleting.value = true
    try {
      await sendDeletePersonRequest(props.treeId, personId.value)
      toast.add({title: 'Person deleted', color: 'success'})
      emit('structureChanged', personId.value)
      return true
    } catch (e) {
      showApiErrorToast(e)
      return false
    } finally {
      isDeleting.value = false
    }
  }

  const updateRootPerson = async () => {
    try {
      await sendUpdateTreeRootPersonRequest(props.treeId, personId.value)
      toast.add({title: 'Root person updated', color: 'success'})
      emit('structureChanged')
    } catch (e) {
      showApiErrorToast(e)
    }
  }

  watch(() => props.person, () => {
    avatarReloadKey.value = 0;
    syncForm()
  }, {immediate: true})
  watch(() => [props.treeId, personId.value, props.person.avatar_photo_id, avatarReloadKey.value], loadAvatar, {immediate: true})

  onBeforeUnmount(() => {
    resetAvatarEditor()
    revokeUrl(avatarUrl.value)
  })

  return {
    editMode, isSaving, isDeleting,
    firstName, lastName, patronymic, selectedGender,
    avatarFileInput, avatarCropper, avatarSourceUrl, avatarUrl, avatarReloadKey,
    handleAvatarFileChange, savePerson, deletePerson, resetAvatarEditor,
    updateRootPerson
  }
}
