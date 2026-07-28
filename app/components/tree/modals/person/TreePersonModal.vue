<script setup lang="ts">
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import { treeFieldUi } from '~/utils/ui/theme/treeTheme'
import { usePersonEditor } from '~/composables/trees/persons/usePersonEdit'
import TreePersonAvatar from '~/components/images/avatars/TreePersonAvatar.vue'
import PersonPhotoGalleryModal from '~/components/common/PersonPhotoGalleryModal.vue'
import { getTreePersonId } from '~/utils/ui/tree/resolveTreePersonId'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  treeId: string
  person: PersonDTO
  avatarUrl?: string
  editable?: boolean
  isRoot?: boolean
  roleLabel?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'updated': [person: PersonDTO]
  'structureChanged': [deletedPersonId?: string]
}>()

const {
  editMode, isSaving, isDeleting,
  firstName, lastName, patronymic,
  avatarFileInput, avatarCropper, avatarSourceUrl, avatarReloadKey,
  handleAvatarFileChange, savePerson, deletePerson, resetAvatarEditor,
  updateRootPerson
} = usePersonEditor(props, emit)

const modalOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})
const galleryOpen = ref(false)
const personId = computed(() => getTreePersonId(props.person))

const modalName = computed(() => {
  const parts = [props.person.first_name, props.person.patronymic, props.person.last_name].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : t('tree.person_modal.unknown_person')
})

const genderLabel = computed(() => {
  if (props.person.gender === 'GENDER_MALE') return t('tree.person_modal.genders.male')
  if (props.person.gender === 'GENDER_FEMALE') return t('tree.person_modal.genders.female')
  return t('tree.person_modal.genders.unspecified')
})

async function handleDelete() {
  const success = await deletePerson(modalName.value)
  if (success) modalOpen.value = false
}

function closeModal() {
  galleryOpen.value = false
  modalOpen.value = false
  editMode.value = false
  resetAvatarEditor()
}
</script>

<template>
  <UModal
    v-model:open="modalOpen"
    :title="modalName"
    :description="t('tree.person_modal.description')"
    :ui="{ content: 'max-h-[90dvh] overflow-y-auto sm:max-w-2xl' }"
  >
    <template #body>
      <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div class="flex flex-col items-start gap-4 rounded-2xl sm:flex-row sm:items-center">
          <TreePersonAvatar
            :key="avatarReloadKey"
            :person="props.person"
            :avatar-url="props.avatarUrl"
            :size="20"
          />
          <div class="min-w-0">
            <h2 class="text-xl font-bold text-accented sm:text-2xl">
              {{ modalName }}
            </h2>
            <p class="text-sm text-muted capitalize">
              {{ genderLabel.toLowerCase() }}
            </p>
          </div>
          <UButton
            v-if="personId"
            type="button"
            color="neutral"
            variant="soft"
            icon="i-lucide-images"
            class="sm:ml-auto"
            @click="galleryOpen = true"
          >
            {{ t('photo_gallery.open') }}
          </UButton>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-muted uppercase tracking-wider">
              {{ t('tree.person_modal.info.first_name') }}
            </p>
            <UInput
              v-model="firstName"
              :disabled="!editMode"
              color="neutral"
              variant="subtle"
              class="w-full"
              :ui="treeFieldUi"
              @keyup.enter="savePerson"
            />
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-muted uppercase tracking-wider">
              {{ t('tree.person_modal.info.last_name') }}
            </p>
            <UInput
              v-model="lastName"
              :disabled="!editMode"
              color="neutral"
              variant="subtle"
              class="w-full"
              :ui="treeFieldUi"
              @keyup.enter="savePerson"
            />
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-muted uppercase tracking-wider">
              {{ t('tree.person_modal.info.patronymic') }}
            </p>
            <UInput
              v-model="patronymic"
              :disabled="!editMode"
              color="neutral"
              variant="subtle"
              class="w-full"
              :ui="treeFieldUi"
              @keyup.enter="savePerson"
            />
          </div>
        </div>

        <div
          v-if="editMode"
          class="flex flex-col gap-4 rounded-2xl border border-default p-4 mt-2"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-muted uppercase tracking-wider">
              {{ t('tree.person_modal.avatar.label') }}
            </p>
            <UButton
              type="button"
              color="neutral"
              variant="subtle"
              size="md"
              icon="i-lucide-image"
              @click="avatarFileInput?.click()"
            >
              {{ t('tree.person_modal.avatar.choose') }}
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
            class="relative aspect-square w-full max-w-75 mx-auto bg-neutral-900/5 overflow-hidden border border-default "
          >
            <CommonAvatarCropper
              ref="avatarCropper"
              :src="avatarSourceUrl"
              :aspect-ratio="1"
              class="h-full w-full"
            />
          </div>
        </div>
      </div>

      <div class="mt-4 flex w-full flex-wrap items-center justify-between gap-3">
        <template v-if="!editMode">
          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-crosshair"
            loading-auto
            @click="updateRootPerson"
          >
            {{ t('tree.person_modal.actions.set_root') }}
          </UButton>

          <div class="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
            <UButton
              color="neutral"
              variant="ghost"
              @click="closeModal"
            >
              {{ t('tree.person_modal.actions.close') }}
            </UButton>
            <UButton
              v-if="editable"
              color="primary"
              icon="i-lucide-pencil"
              @click="editMode = true"
            >
              {{ t('tree.person_modal.actions.edit') }}
            </UButton>
          </div>
        </template>

        <template v-else>
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            :loading="isDeleting"
            @click="handleDelete"
          >
            {{ t('tree.person_modal.actions.delete') }}
          </UButton>

          <div class="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
            <UButton
              class="sm:ml-auto"
              color="neutral"
              variant="soft"
              @click="editMode = false"
            >
              {{ t('common.cancel') }}
            </UButton>
            <UButton
              :loading="isSaving"
              color="primary"
              @click="savePerson"
            >
              {{ t('tree.person_modal.actions.save') }}
            </UButton>
          </div>
        </template>
      </div>
    </template>
  </UModal>

  <PersonPhotoGalleryModal
    v-if="personId"
    v-model:open="galleryOpen"
    :tree-id="treeId"
    :subject-id="personId"
    source="family"
    :editable="editable"
  />
</template>
