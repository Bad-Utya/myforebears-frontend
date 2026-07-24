import type PublicPersonDTO from '~/services/publicPersons/dtos/inner/PublicPersonDTO'
import sendGetPublicPersonRequest from '~/services/publicPersons/getPublicPerson'
import sendUpdatePublicPersonRequest from '~/services/publicPersons/updatePublicPerson'
import UpdatePublicPersonRequest from '~/services/publicPersons/dtos/requests/UpdatePublicPersonRequest'
import sendDeletePublicPersonRequest from '~/services/publicPersons/deletePublicPerson'
import sendUploadPublicPersonPhotoRequest from '~/services/publicPersons/uploadPublicPersonPhoto'
import sendGetPublicPersonPhotoRequest from '~/services/publicPersons/getPublicPersonPhoto'
import sendReplacePublicPersonTagsRequest from '~/services/tags/replacePublicPersonTags'
import sendCreateTreeFromPublicPersonRequest from '~/services/publicPersons/createTreeFromPublicPerson'
import { useAvailableTags } from '~/composables/tags/useAvailableTags'
import { getPublicPersonFullName, normalizePublicPersonGender, type NormalizedPublicPersonGender } from '~/utils/ui/publicPersons/publicPersonHelpers'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import useUserDataHandler from '~/utils/scripts/storages/get/userDataHandler'
import type DataDTO from '~/services/api/dtos/DataDTO'
import type { GetPublicPersonResponse } from '~/services/publicPersons/dtos/responses/GetPublicPersonResponse'
import type { CreateTreeFromPublicPersonResponse } from '~/services/publicPersons/dtos/responses/CreateTreeFromPublicPersonResponse'

type AvatarCropperHandle = {
  exportFile: (fileName?: string, size?: number) => Promise<File | null>
}

type PublicPersonModalProps = {
  open: boolean
  person: PublicPersonDTO | null
  editable?: boolean
}

type PublicPersonModalEmit = {
  (event: 'updated', value: PublicPersonDTO): void
  (event: 'deleted', value: string): void
}

export function usePublicPersonEditor(
  props: PublicPersonModalProps,
  emit: PublicPersonModalEmit
) {
  const { t } = useI18n()
  const toast = useToast()
  const { userData, ensureLoaded } = useUserDataHandler()

  const currentPerson = ref<PublicPersonDTO | null>(null)
  const editMode = ref(false)
  const loading = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const isCreatingTree = ref(false)

  const firstName = ref('')
  const lastName = ref('')
  const patronymic = ref('')
  const biography = ref('')
  const selectedGender = ref<NormalizedPublicPersonGender>(null)

  const avatarFileInput = ref<HTMLInputElement | null>(null)
  const avatarCropper = ref<AvatarCropperHandle | null>(null)
  const avatarSourceUrl = ref<string | null>(null)
  const avatarUrl = ref<string | null>(null)
  const avatarReloadKey = ref(0)

  const tagsPopoverOpen = ref(false)
  const selectedTagCode = ref<string | undefined>(undefined)
  const selectedTagCodes = ref<string[]>([])
  const { tags, loading: tagsLoading, loadTags } = useAvailableTags()

  const fullName = computed(() => {
    return currentPerson.value
      ? getPublicPersonFullName(currentPerson.value)
      : t('public_persons.unknown_person')
  })

  const birthYear = computed(() => {
    const personEvents = Array.isArray(currentPerson.value?.events)
      ? currentPerson.value.events
      : []

    const birthEvent = personEvents.find(event => event.date_iso && event.event_type_name?.toLowerCase().includes('birth'))
      ?? personEvents.find(event => event.date_iso)

    return birthEvent?.date_iso?.slice(0, 4)
  })

  const canEdit = computed(() => {
    if (typeof props.editable === 'boolean') {
      return props.editable
    }

    return Boolean(currentPerson.value?.owner_user_id && currentPerson.value.owner_user_id === userData.value?.id)
  })

  const genderLabel = computed(() => {
    if (selectedGender.value === 'MALE') {
      return t('public_persons.genders.male')
    }

    if (selectedGender.value === 'FEMALE') {
      return t('public_persons.genders.female')
    }

    return t('public_persons.genders.unspecified')
  })

  const tagsText = computed(() => {
    return selectedTagCodes.value
      .map(code => tags.value.find(tag => tag.code === code) ?? currentPerson.value?.tags?.find(tag => tag.code === code))
      .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag))
  })

  const availableTagOptions = computed(() => {
    return tags.value
      .filter(tag => tag.code && !selectedTagCodes.value.includes(tag.code))
      .map(tag => ({
        label: tag.name ?? tag.code ?? '',
        value: tag.code ?? '',
        description: tag.description
      }))
  })

  function revokeUrl(url: string | null) {
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }

  function syncForm(person: PublicPersonDTO | null) {
    firstName.value = person?.first_name ?? ''
    lastName.value = person?.last_name ?? ''
    patronymic.value = person?.patronymic ?? ''
    biography.value = person?.biography ?? ''
    selectedGender.value = normalizePublicPersonGender(person?.gender)
    selectedTagCodes.value = Array.isArray(person?.tags)
      ? person.tags
          .map(tag => tag.code)
          .filter((code): code is string => Boolean(code))
      : []
  }

  function resetAvatarEditor() {
    revokeUrl(avatarSourceUrl.value)
    avatarSourceUrl.value = null

    if (avatarFileInput.value) {
      avatarFileInput.value.value = ''
    }
  }

  async function loadAvatar() {
    const personId = currentPerson.value?.id
    const photoId = currentPerson.value?.avatar_photo_id

    if (!personId || !photoId) {
      revokeUrl(avatarUrl.value)
      avatarUrl.value = null
      return
    }

    try {
      const blob = await sendGetPublicPersonPhotoRequest(personId, photoId)
      const nextUrl = URL.createObjectURL(blob)
      revokeUrl(avatarUrl.value)
      avatarUrl.value = nextUrl
    } catch {
      revokeUrl(avatarUrl.value)
      avatarUrl.value = null
    }
  }

  async function loadPerson() {
    if (!props.person?.id) {
      currentPerson.value = props.person
      syncForm(props.person)
      return
    }

    loading.value = true

    try {
      const response = await sendGetPublicPersonRequest(props.person.id) as DataDTO<GetPublicPersonResponse>
      currentPerson.value = response.data?.person ?? props.person
      syncForm(currentPerson.value)
      await loadAvatar()
    } catch (error) {
      currentPerson.value = props.person
      syncForm(props.person)
      showApiErrorToast(error)
    } finally {
      loading.value = false
    }
  }

  function handleAvatarFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]

    if (!file?.type.startsWith('image/')) {
      return
    }

    revokeUrl(avatarSourceUrl.value)
    avatarSourceUrl.value = URL.createObjectURL(file)
  }

  function addTag() {
    if (!selectedTagCode.value || selectedTagCodes.value.includes(selectedTagCode.value)) {
      return
    }

    selectedTagCodes.value = [...selectedTagCodes.value, selectedTagCode.value]
    selectedTagCode.value = undefined
  }

  function removeTag(code?: string) {
    if (!code) {
      return
    }

    selectedTagCodes.value = selectedTagCodes.value.filter(tagCode => tagCode !== code)
  }

  async function refreshCurrentPerson() {
    if (!currentPerson.value?.id) {
      return null
    }

    const response = await sendGetPublicPersonRequest(currentPerson.value.id) as DataDTO<GetPublicPersonResponse>
    currentPerson.value = response.data?.person ?? currentPerson.value
    syncForm(currentPerson.value)
    await loadAvatar()
    return currentPerson.value
  }

  async function savePerson() {
    if (!currentPerson.value?.id) {
      return
    }

    isSaving.value = true

    try {
      await sendUpdatePublicPersonRequest(
        currentPerson.value.id,
        new UpdatePublicPersonRequest(
          firstName.value.trim() || undefined,
          lastName.value.trim() || undefined,
          patronymic.value.trim() || undefined,
          selectedGender.value ?? undefined,
          biography.value.trim() || undefined
        )
      )

      if (avatarCropper.value) {
        const file = await avatarCropper.value.exportFile('public-person-avatar.png', 512)

        if (file) {
          await sendUploadPublicPersonPhotoRequest(currentPerson.value.id, file, true)
          avatarReloadKey.value += 1
        }
      }

      await sendReplacePublicPersonTagsRequest(currentPerson.value.id, selectedTagCodes.value)
      const updatedPerson = await refreshCurrentPerson()

      if (updatedPerson) {
        emit('updated', updatedPerson)
      }

      toast.add({
        title: t('public_persons.actions.updated'),
        color: 'success'
      })

      editMode.value = false
      resetAvatarEditor()
    } catch (error) {
      showApiErrorToast(error)
    } finally {
      isSaving.value = false
    }
  }

  async function deletePerson() {
    if (!currentPerson.value?.id || isDeleting.value || !window.confirm(t('public_persons.actions.confirm_delete', { name: fullName.value }))) {
      return false
    }

    isDeleting.value = true

    try {
      await sendDeletePublicPersonRequest(currentPerson.value.id)
      emit('deleted', currentPerson.value.id)
      toast.add({
        title: t('public_persons.actions.deleted'),
        color: 'success'
      })
      return true
    } catch (error) {
      showApiErrorToast(error)
      return false
    } finally {
      isDeleting.value = false
    }
  }

  async function createTreeFromPerson() {
    if (!currentPerson.value?.id) {
      return
    }

    isCreatingTree.value = true

    try {
      const response = await sendCreateTreeFromPublicPersonRequest(
        currentPerson.value.id,
        fullName.value
      ) as DataDTO<CreateTreeFromPublicPersonResponse>

      const treeId = response.data?.tree?.id

      if (!treeId) {
        throw new Error('Tree id is missing')
      }

      await navigateTo(`/trees/${treeId}/main`)
    } catch (error) {
      showApiErrorToast(error)
    } finally {
      isCreatingTree.value = false
    }
  }

  function closeEditMode() {
    editMode.value = false
    syncForm(currentPerson.value)
    resetAvatarEditor()
  }

  watch(tagsPopoverOpen, (isOpen) => {
    if (isOpen) {
      void loadTags()
    }
  })

  watch(() => props.person, () => {
    currentPerson.value = props.person
    syncForm(props.person)
  }, { immediate: true })

  watch(() => props.open, async (isOpen) => {
    if (!isOpen) {
      closeEditMode()
      return
    }

    await ensureLoaded()
    await loadPerson()
  }, { immediate: true })

  onBeforeUnmount(() => {
    resetAvatarEditor()
    revokeUrl(avatarUrl.value)
  })

  return {
    currentPerson,
    fullName,
    birthYear,
    genderLabel,
    loading,
    canEdit,
    editMode,
    isSaving,
    isDeleting,
    isCreatingTree,
    firstName,
    lastName,
    patronymic,
    biography,
    selectedGender,
    avatarFileInput,
    avatarCropper,
    avatarSourceUrl,
    avatarUrl,
    avatarReloadKey,
    tagsPopoverOpen,
    selectedTagCode,
    selectedTagCodes,
    tagsLoading,
    tagsText,
    availableTagOptions,
    handleAvatarFileChange,
    addTag,
    removeTag,
    savePerson,
    deletePerson,
    createTreeFromPerson,
    closeEditMode
  }
}
