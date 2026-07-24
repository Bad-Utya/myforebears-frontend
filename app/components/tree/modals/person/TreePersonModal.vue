<script setup lang="ts">
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import {treeFieldUi} from '~/utils/ui/theme/treeTheme'
import {usePersonEditor} from "~/composables/trees/persons/usePersonEdit";
import TreePersonAvatar from "~/components/images/avatars/TreePersonAvatar.vue";

const {t} = useI18n()

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
  'structureChanged': []
}>()

const {
  editMode, isSaving, isDeleting,
  firstName, lastName, patronymic, selectedGender,
  avatarFileInput, avatarCropper, avatarSourceUrl, avatarReloadKey,
  handleAvatarFileChange, savePerson, deletePerson, resetAvatarEditor,
  updateRootPerson
} = usePersonEditor(props, emit)

const modalOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const modalName = computed(() => {
  const parts = [props.person.first_name, props.person.patronymic, props.person.last_name].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : t('tree.person_modal.unknown_person')
})

const birthYear = computed(() => props.person.birth_event?.date_iso?.slice(0, 4))

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
  >
    <template #body>
      <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">

        <div class="flex items-center gap-4 rounded-2xl">
          <TreePersonAvatar
            :key="avatarReloadKey"
            :person="props.person"
            :avatarUrl="props.avatarUrl"
            :size="20"
          />
          <div class="min-w-0">
            <h2 class="text-2xl font-bold text-accented">{{ modalName }}</h2>
            <p class="text-sm text-muted capitalize">
              {{ genderLabel.toLowerCase() }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 grid-rows-2 gap-4">

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

        <div v-if="editMode" class="flex flex-col gap-4 rounded-2xl border border-default p-4 mt-2">
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

          <div v-if="avatarSourceUrl" class="relative aspect-square w-full max-w-75 mx-auto bg-neutral-900/5 overflow-hidden border border-default ">
            <CommonAvatarCropper
              ref="avatarCropper"
              :src="avatarSourceUrl"
              :aspect-ratio="1"
              class="h-full w-full"
            />
          </div>
        </div>
      </div>

      <div class="mt-4 flex flex-row justify-between items-center w-full">
        <template v-if="!editMode">
          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-crosshair"
            loading-auto
            @click="updateRootPerson"
          >{{ t('tree.person_modal.actions.set_root') }}</UButton>

          <div class="flex w-fit ml-auto gap-2 items-center">
            <UButton
              color="neutral"
              variant="ghost"
              @click="closeModal"
            >
              {{ t('tree.person_modal.actions.close') }}
            </UButton>
            <UButton
              color="primary"
              icon="i-lucide-pencil"
              @click="editMode = true"
              v-if="editable"
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
          >{{ t('tree.person_modal.actions.delete') }}</UButton>

          <div class="flex w-fit ml-auto gap-2 items-center">
            <UButton
              class="ml-auto"
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
</template>
