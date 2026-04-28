<script setup lang="ts">
import AvatarCropper from '~/components/common/AvatarCropper.vue'
import sendAddChildRequest from '~/composables/scripts/familytree/addChild'
import sendAddParentRequest from '~/composables/scripts/familytree/addParent'
import sendAddPartnerRequest from '~/composables/scripts/familytree/addPartner'
import sendDeletePersonRequest from '~/composables/scripts/familytree/deletePerson'
import type PersonDTO from '~/composables/scripts/familytree/dtos/inner/PersonDTO'
import AddChildRequest from '~/composables/scripts/familytree/dtos/requests/AddChildRequest'
import AddParentRequest from '~/composables/scripts/familytree/dtos/requests/AddParentRequest'
import AddPartnerRequest from '~/composables/scripts/familytree/dtos/requests/AddPartnerRequest'
import sendUpdatePersonGenderRequest from '~/composables/scripts/familytree/updatePersonGender'
import sendUpdatePersonNameRequest from '~/composables/scripts/familytree/updatePersonName'
import sendGetPersonAvatarRequest from '~/composables/scripts/photos/getPersonAvatar'
import sendUploadPersonAvatarRequest from '~/composables/scripts/photos/uploadPersonAvatar'
import { getTreePersonId } from '~/composables/scripts/tree/resolveTreeRootPersonId'
import showApiErrorToast from '~/composables/scripts/ui/showApiErrorToast'

type ParentRole = 'FATHER' | 'MOTHER'
type ChildGender = 'MALE' | 'FEMALE'
type EditableGender = 'MALE' | 'FEMALE' | null
type CreateActionType = 'child' | 'parent' | 'partner' | null

const props = defineProps<{
  treeId: string
  person: PersonDTO
  x: number
  y: number
  width: number
  height: number
  isRoot?: boolean
  editable?: boolean
  partnerId?: string
  roleLabel?: string
  availableParentRoles?: ParentRole[]
}>()

const emit = defineEmits<{
  updated: [person: PersonDTO]
  structureChanged: []
}>()

const toast = useToast()
const canEdit = toRef(props, 'editable')
const modalOpen = ref(false)
const editMode = ref(false)
const createModalOpen = ref(false)
const activeCreateAction = ref<CreateActionType>(null)
const isSaving = ref(false)
const isCreating = ref(false)
const isDeleting = ref(false)
const avatarFileInput = ref<HTMLInputElement | null>(null)
const avatarCropper = ref<{ exportFile: (fileName?: string, size?: number) => Promise<File> } | null>(null)
const avatarSourceUrl = ref<string | null>(null)
const avatarUrl = ref<string | null>(null)
const avatarReloadKey = ref(0)
const firstName = ref('')
const lastName = ref('')
const patronymic = ref('')
const selectedGender = ref<EditableGender>(null)
const createFirstName = ref('')
const createLastName = ref('')
const createPatronymic = ref('')
const selectedParentRole = ref<ParentRole>('FATHER')
const selectedChildGender = ref<ChildGender>('MALE')
const createRelatedPersonIds = ref<string[]>([])
const personId = computed(() => getTreePersonId(props.person))
const hasAvatar = computed(() => Boolean(props.person.avatar_photo_id) || avatarReloadKey.value > 0)

const cardStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  width: `${props.width}px`,
  height: `${props.height}px`
}))

const fullName = computed(() => {
  const nameParts = [
    props.person.first_name,
    props.person.last_name
  ].filter(Boolean)

  return nameParts.length > 0 ? nameParts.join(' ') : 'Unknown person'
})

const modalName = computed(() => {
  const nameParts = [
    props.person.first_name,
    props.person.patronymic,
    props.person.last_name
  ].filter(Boolean)

  return nameParts.length > 0 ? nameParts.join(' ') : 'Unknown person'
})

const initials = computed(() => {
  return fullName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
})

const birthYear = computed(() => {
  const isoDate = props.person.birth_event?.date_iso

  if (!isoDate) {
    return undefined
  }

  return isoDate.slice(0, 4)
})

const genderLabel = computed(() => {
  switch (props.person.gender) {
    case 'GENDER_MALE':
      return 'Male'
    case 'GENDER_FEMALE':
      return 'Female'
    default:
      return 'Unspecified'
  }
})

const toneClass = computed(() => {
  switch (props.person.gender) {
    case 'GENDER_MALE':
      return 'tree-node--male'
    case 'GENDER_FEMALE':
      return 'tree-node--female'
    default:
      return 'tree-node--unspecified'
  }
})

const hasPartner = computed(() => Boolean(props.partnerId))
const canAddParent = computed(() => (props.availableParentRoles?.length ?? 0) > 0)

const createActionTitle = computed(() => {
  switch (activeCreateAction.value) {
    case 'child':
      return 'Add child'
    case 'parent':
      return 'Add parent'
    case 'partner':
      return 'Add partner'
    default:
      return 'Create person'
  }
})

const selectedParentRoleLabel = computed(() => {
  return selectedParentRole.value === 'FATHER' ? 'Father' : 'Mother'
})

function normalizeEditableGender(gender?: string): EditableGender {
  switch (gender) {
    case 'GENDER_MALE':
    case 'MALE':
      return 'MALE'
    case 'GENDER_FEMALE':
    case 'FEMALE':
      return 'FEMALE'
    default:
      return null
  }
}

function revokeAvatarSourceUrl() {
  if (!avatarSourceUrl.value?.startsWith('blob:')) {
    return
  }

  URL.revokeObjectURL(avatarSourceUrl.value)
}

function revokeLoadedAvatarUrl() {
  if (!avatarUrl.value?.startsWith('blob:')) {
    return
  }

  URL.revokeObjectURL(avatarUrl.value)
}

function resetAvatarEditor() {
  revokeAvatarSourceUrl()
  avatarSourceUrl.value = null

  if (avatarFileInput.value) {
    avatarFileInput.value.value = ''
  }
}

async function loadAvatar() {
  if (!personId.value || !hasAvatar.value) {
    revokeLoadedAvatarUrl()
    avatarUrl.value = null
    return
  }

  try {
    const avatarBlob = await sendGetPersonAvatarRequest(props.treeId, personId.value)
    const nextAvatarUrl = URL.createObjectURL(avatarBlob)

    revokeLoadedAvatarUrl()
    avatarUrl.value = nextAvatarUrl
  } catch {
    revokeLoadedAvatarUrl()
    avatarUrl.value = null
  }
}

async function buildAvatarFile() {
  if (!avatarCropper.value) {
    return null
  }

  return await avatarCropper.value.exportFile('person-avatar.png', 512)
}

function syncForm() {
  firstName.value = props.person.first_name ?? ''
  lastName.value = props.person.last_name ?? ''
  patronymic.value = props.person.patronymic ?? ''
  selectedGender.value = normalizeEditableGender(props.person.gender)
}

function resetCreateForm() {
  createFirstName.value = ''
  createLastName.value = props.person.last_name ?? ''
  createPatronymic.value = ''
  selectedChildGender.value = 'MALE'
  selectedParentRole.value = props.availableParentRoles?.[0] ?? 'FATHER'
  createRelatedPersonIds.value = []
}

function openModal() {
  syncForm()
  editMode.value = false
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editMode.value = false
  resetAvatarEditor()
}

function openCreateModal(action: CreateActionType, event?: Event, relatedPersonIds?: string[]) {
  event?.stopPropagation()

  if (!action) {
    return
  }

  resetCreateForm()
  createRelatedPersonIds.value = Array.isArray(relatedPersonIds)
    ? relatedPersonIds.filter(Boolean)
    : []
  activeCreateAction.value = action
  createModalOpen.value = true
}

function closeCreateModal() {
  createModalOpen.value = false
  activeCreateAction.value = null
  createRelatedPersonIds.value = []
}

defineExpose({
  openCreateModal
})

async function savePerson() {
  if (!personId.value) {
    return
  }

  isSaving.value = true

  try {
    const currentGender = normalizeEditableGender(props.person.gender)
    const hasNameChanges = firstName.value !== (props.person.first_name ?? '')
      || lastName.value !== (props.person.last_name ?? '')
      || patronymic.value !== (props.person.patronymic ?? '')
    const hasGenderChanges = selectedGender.value !== null && selectedGender.value !== currentGender
    const avatarFile = await buildAvatarFile()
    let updatedPerson = props.person

    if (hasNameChanges) {
      const response = await sendUpdatePersonNameRequest(
        props.treeId,
        personId.value,
        firstName.value,
        lastName.value,
        patronymic.value
      )
      updatedPerson = response.data?.person ?? updatedPerson
    }

    if (hasGenderChanges && selectedGender.value) {
      const response = await sendUpdatePersonGenderRequest(
        props.treeId,
        personId.value,
        selectedGender.value
      )
      updatedPerson = response.data?.person ?? updatedPerson
    }

    if (avatarFile) {
      await sendUploadPersonAvatarRequest(props.treeId, personId.value, avatarFile)
      avatarReloadKey.value += 1
      await loadAvatar()
    }

    if (updatedPerson) {
      emit('updated', updatedPerson)
    }

    toast.add({
      title: 'Person updated',
      description: 'Tree member information was updated.',
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

async function handleAvatarFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    toast.add({
      title: 'Please choose an image file',
      color: 'error'
    })
    input.value = ''
    return
  }

  try {
    revokeAvatarSourceUrl()
    avatarSourceUrl.value = URL.createObjectURL(file)
  } catch (error) {
    showApiErrorToast(error)
  }
}

async function createRelatedPerson() {
  if (!personId.value || !activeCreateAction.value) {
    return
  }

  isCreating.value = true

  try {
    if (activeCreateAction.value === 'child') {
      const childParentIds = createRelatedPersonIds.value.length > 0
        ? createRelatedPersonIds.value
        : [personId.value, props.partnerId ?? ''].filter(Boolean)

      await sendAddChildRequest(
        props.treeId,
        new AddChildRequest(
          createFirstName.value,
          createLastName.value,
          createPatronymic.value,
          selectedChildGender.value,
          childParentIds[0] ?? personId.value,
          childParentIds[1] ?? ''
        )
      )
    }

    if (activeCreateAction.value === 'parent') {
      await sendAddParentRequest(
        props.treeId,
        new AddParentRequest(
          personId.value,
          createFirstName.value,
          createLastName.value,
          createPatronymic.value,
          selectedParentRole.value
        )
      )
    }

    if (activeCreateAction.value === 'partner') {
      await sendAddPartnerRequest(
        props.treeId,
        new AddPartnerRequest(
          personId.value,
          createFirstName.value,
          createLastName.value,
          createPatronymic.value
        )
      )
    }

    toast.add({
      title: 'Tree updated',
      description: 'The family tree structure was updated.',
      color: 'success'
    })

    closeCreateModal()
    emit('structureChanged')
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    isCreating.value = false
  }
}

async function deletePerson() {
  if (!personId.value || isDeleting.value) {
    return
  }

  const shouldDelete = window.confirm(`Delete ${modalName.value}?`)

  if (!shouldDelete) {
    return
  }

  isDeleting.value = true

  try {
    await sendDeletePersonRequest(props.treeId, personId.value)

    toast.add({
      title: 'Person deleted',
      description: 'The person was removed from this tree.',
      color: 'success'
    })

    closeModal()
    emit('structureChanged')
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    isDeleting.value = false
  }
}

watch(() => props.person, () => {
  avatarReloadKey.value = 0
  syncForm()
}, { immediate: true })

watch(
  () => [props.treeId, personId.value, props.person.avatar_photo_id, avatarReloadKey.value],
  async () => {
    await loadAvatar()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  resetAvatarEditor()
  revokeLoadedAvatarUrl()
})
</script>

<template>
  <article
    data-tree-node="true"
    class="tree-node absolute overflow-visible"
    :class="toneClass"
    :style="cardStyle"
  >
    <div
      class="tree-node__card relative h-full overflow-hidden rounded-[28px] border border-default"
      :class="{ 'tree-node__card--root': isRoot }"
      @click="openModal"
    >
      <div class="relative flex h-full items-center gap-3 p-4">
        <div class="tree-node__avatar-shell shrink-0">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            :alt="fullName"
            class="size-full object-cover"
            loading="lazy"
          >
          <div
            v-else
            class="tree-node__avatar-fallback"
          >
            {{ initials }}
          </div>
        </div>

        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-highlighted">
            {{ fullName }}
          </p>
        </div>
      </div>
    </div>
  </article>

  <UModal
    v-model:open="modalOpen"
    :title="modalName"
    :description="isRoot ? 'Root person of this tree.' : 'Family member details.'"
  >
    <template #body>
      <div class="space-y-5">
        <div class="flex items-start gap-4">
          <div class="tree-node__avatar-shell shrink-0">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="modalName"
              class="size-full object-cover"
              loading="lazy"
            >
            <div
              v-else
              class="tree-node__avatar-fallback"
            >
              {{ initials }}
            </div>
          </div>

          <div class="min-w-0">
            <p class="text-lg font-semibold text-highlighted">
              {{ modalName }}
            </p>
            <p class="mt-1 text-sm text-muted">
              {{ genderLabel }}
              <template v-if="birthYear">
                · Born {{ birthYear }}
              </template>
            </p>
          </div>
        </div>

        <div
          v-if="!editMode"
          class="grid gap-3 sm:grid-cols-2"
        >
          <div class="tree-node__info">
            <span class="tree-node__info-label">Role</span>
            <span class="tree-node__info-value">{{ props.roleLabel || 'Family member' }}</span>
          </div>
          <div class="tree-node__info">
            <span class="tree-node__info-label">Gender</span>
            <span class="tree-node__info-value">{{ genderLabel }}</span>
          </div>
          <div class="tree-node__info">
            <span class="tree-node__info-label">First name</span>
            <span class="tree-node__info-value">{{ props.person.first_name || '—' }}</span>
          </div>
          <div class="tree-node__info">
            <span class="tree-node__info-label">Last name</span>
            <span class="tree-node__info-value">{{ props.person.last_name || '—' }}</span>
          </div>
          <div class="tree-node__info sm:col-span-2">
            <span class="tree-node__info-label">Patronymic</span>
            <span class="tree-node__info-value">{{ props.person.patronymic || '—' }}</span>
          </div>
        </div>

        <form
          v-else
          class="space-y-4"
          @submit.prevent="savePerson"
        >
          <UInput
            v-model="firstName"
            color="neutral"
            variant="subtle"
            placeholder="First name"
          />
          <UInput
            v-model="lastName"
            color="neutral"
            variant="subtle"
            placeholder="Last name"
          />
          <UInput
            v-model="patronymic"
            color="neutral"
            variant="subtle"
            placeholder="Patronymic"
          />

          <div class="space-y-2">
            <p class="tree-node__info-label">
              Gender
            </p>
            <div class="inline-flex rounded-full border border-default p-1">
              <UButton
                type="button"
                size="xs"
                color="neutral"
                :variant="selectedGender === 'MALE' ? 'soft' : 'ghost'"
                @click="selectedGender = 'MALE'"
              >
                Male
              </UButton>
              <UButton
                type="button"
                size="xs"
                color="neutral"
                :variant="selectedGender === 'FEMALE' ? 'soft' : 'ghost'"
                @click="selectedGender = 'FEMALE'"
              >
                Female
              </UButton>
            </div>
          </div>

          <div class="space-y-3 rounded-2xl border border-default bg-default/60 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-medium text-highlighted">
                  Avatar
                </p>
                <p class="text-xs text-muted">
                  Upload and crop a square avatar for this person.
                </p>
              </div>

              <UButton
                type="button"
                color="neutral"
                variant="outline"
                @click="avatarFileInput?.click()"
              >
                Choose image
              </UButton>
            </div>

            <input
              ref="avatarFileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarFileChange"
            >

            <div
              v-if="avatarSourceUrl"
              class="space-y-3"
            >
              <div
                class="tree-node__cropper rounded-2xl border border-default bg-elevated/70 p-3"
              >
                <AvatarCropper
                  ref="avatarCropper"
                  :src="avatarSourceUrl"
                  class="mx-auto block max-h-72 w-full object-contain"
                />
              </div>
              <p class="text-xs text-muted">
                New avatar will be uploaded when you save changes.
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              @click="editMode = false"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              :loading="isSaving"
            >
              Save
            </UButton>
          </div>
        </form>

        <div
          v-if="!editMode"
          class="flex justify-end gap-3"
        >
          <UButton
            v-if="canEdit"
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            :loading="isDeleting"
            @click="deletePerson"
          >
            Delete
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            @click="closeModal"
          >
            Close
          </UButton>
          <UButton
            v-if="canEdit"
            color="neutral"
            variant="soft"
            icon="i-lucide-pencil"
            @click="editMode = true"
          >
            Edit
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <UModal
    v-model:open="createModalOpen"
    :title="createActionTitle"
    description="Create a new related person in this tree."
  >
    <template #body>
      <form
        class="space-y-4"
        @submit.prevent="createRelatedPerson"
      >
        <UInput
          v-model="createFirstName"
          color="neutral"
          variant="subtle"
          placeholder="First name"
        />
        <UInput
          v-model="createLastName"
          color="neutral"
          variant="subtle"
          placeholder="Last name"
        />
        <UInput
          v-model="createPatronymic"
          color="neutral"
          variant="subtle"
          placeholder="Patronymic"
        />

        <div
          v-if="activeCreateAction === 'child'"
          class="space-y-2"
        >
          <p class="tree-node__info-label">
            Gender
          </p>
          <div class="inline-flex rounded-full border border-default p-1">
            <UButton
              type="button"
              size="xs"
              color="neutral"
              :variant="selectedChildGender === 'MALE' ? 'soft' : 'ghost'"
              @click="selectedChildGender = 'MALE'"
            >
              Male
            </UButton>
            <UButton
              type="button"
              size="xs"
              color="neutral"
              :variant="selectedChildGender === 'FEMALE' ? 'soft' : 'ghost'"
              @click="selectedChildGender = 'FEMALE'"
            >
              Female
            </UButton>
          </div>
        </div>

        <div
          v-if="activeCreateAction === 'parent' && canAddParent"
          class="space-y-2"
        >
          <p class="tree-node__info-label">
            Role
          </p>
          <div class="inline-flex rounded-full border border-default p-1">
            <UButton
              type="button"
              v-for="role in props.availableParentRoles"
              :key="role"
              size="xs"
              color="neutral"
              :variant="selectedParentRole === role ? 'soft' : 'ghost'"
              @click="selectedParentRole = role"
            >
              {{ role === 'FATHER' ? 'Father' : 'Mother' }}
            </UButton>
          </div>
          <p class="text-xs text-muted">
            Gender will be created as {{ selectedParentRoleLabel.toLowerCase() }}.
          </p>
        </div>

        <div class="flex justify-end gap-3">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            @click="closeCreateModal"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            :loading="isCreating"
          >
            Create
          </UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>

<style scoped>
.tree-node {
  z-index: 2;
}

.tree-node__card {
  background: var(--tree-node-bg);
  border: 0;
}

.tree-node__card--root {
}

.tree-node__avatar-shell {
  display: flex;
  height: 62px;
  width: 62px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  overflow: hidden;
  background: var(--tree-avatar-bg);
}

.tree-node__avatar-fallback {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  color: var(--tree-avatar-text);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tree-node--male {
  --tree-node-bg: color-mix(in srgb, var(--color-slateblue-950) 72%, var(--color-carbon-950) 28%);
  --tree-avatar-bg: color-mix(in srgb, var(--color-slateblue-700) 26%, var(--color-carbon-300) 74%);
  --tree-avatar-text: var(--color-slateblue-50);
}

.tree-node--female {
  --tree-node-bg: color-mix(in srgb, var(--color-coral-950) 54%, var(--color-carbon-950) 46%);
  --tree-avatar-bg: color-mix(in srgb, var(--color-coral-700) 24%, var(--color-carbon-300) 76%);
  --tree-avatar-text: var(--color-coral-50);
}

.tree-node--unspecified {
  --tree-node-bg: color-mix(in srgb, var(--color-pine-950) 60%, var(--color-carbon-950) 40%);
  --tree-avatar-bg: color-mix(in srgb, var(--color-pine-700) 24%, var(--color-carbon-300) 76%);
  --tree-avatar-text: var(--color-pine-50);
}

.tree-node__info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  background: color-mix(in srgb, white 4%, transparent 96%);
  padding: 0.875rem 1rem;
}

.tree-node__info-label {
  color: color-mix(in srgb, white 58%, var(--ui-primary) 42%);
  font-size: 0.73rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.tree-node__info-value {
  color: color-mix(in srgb, white 88%, var(--ui-primary) 12%);
  font-size: 0.95rem;
}

.tree-node__cropper {
  min-height: 18rem;
}

.tree-node__cropper :deep(.vue-advanced-cropper) {
  min-height: 18rem;
}
</style>
