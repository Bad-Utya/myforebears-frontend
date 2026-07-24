<script setup lang="ts">
import type PublicPersonDTO from '~/services/publicPersons/dtos/inner/PublicPersonDTO'
import { treeFieldUi, treeTextareaUi } from '~/utils/ui/theme/treeTheme'
import TreePersonAvatar from '~/components/images/avatars/TreePersonAvatar.vue'
import { usePublicPersonEditor } from '~/composables/publicPersons/usePublicPersonEditor'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  open: boolean
  person: PublicPersonDTO | null
  editable?: boolean
  showCreateTreeAction?: boolean
}>(), {
  showCreateTreeAction: true
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'updated': [person: PublicPersonDTO]
  'deleted': [personId: string]
}>()

const modalOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const {
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
} = usePublicPersonEditor(props, emit)

const events = computed(() => {
  return Array.isArray(currentPerson.value?.events)
    ? [...currentPerson.value.events].sort((left, right) => (left.date_iso || '').localeCompare(right.date_iso || ''))
    : []
})

function formatEventDate(dateIso?: string, dateUnknown?: boolean) {
  if (dateUnknown || !dateIso) {
    return t('public_persons.events.unknown_date')
  }

  return dateIso
}

async function handleDelete() {
  const success = await deletePerson()

  if (success) {
    modalOpen.value = false
  }
}

function closeModal() {
  modalOpen.value = false
  closeEditMode()
}
</script>

<template>
  <UModal
    v-model:open="modalOpen"
    :title="fullName"
    :description="t('public_persons.modal_description')"
    :ui="{ content: 'max-h-[90dvh] overflow-y-auto sm:max-w-2xl' }"
  >
    <template #body>
      <div
        v-if="currentPerson"
        class="mx-auto flex w-full max-w-3xl flex-col gap-4"
      >
        <div
          v-if="loading"
          class="space-y-3"
        >
          <USkeleton class="h-20 w-full rounded-2xl" />
          <USkeleton class="h-40 w-full rounded-2xl" />
        </div>

        <template v-else>
          <div class="flex flex-col items-start gap-4 rounded-2xl sm:flex-row sm:items-center">
            <TreePersonAvatar
              :key="avatarReloadKey"
              :person="{
                first_name: currentPerson.first_name,
                last_name: currentPerson.last_name,
                gender: currentPerson.gender
              }"
              :avatar-url="avatarUrl ?? undefined"
              :size="20"
            />

            <div class="min-w-0">
              <h2 class="text-xl font-bold text-accented sm:text-2xl">
                {{ fullName }}
              </h2>
              <p class="text-sm text-muted capitalize">
                {{ genderLabel.toLowerCase() }}
                <span v-if="birthYear">
                  · {{ birthYear }}
                </span>
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1">
              <p class="text-xs font-semibold uppercase tracking-wider text-muted">
                {{ t('public_persons.create.first_name') }}
              </p>
              <UInput
                v-model="firstName"
                :disabled="!editMode"
                color="neutral"
                variant="subtle"
                class="w-full"
                :ui="treeFieldUi"
              />
            </div>

            <div class="flex flex-col gap-1">
              <p class="text-xs font-semibold uppercase tracking-wider text-muted">
                {{ t('public_persons.create.last_name') }}
              </p>
              <UInput
                v-model="lastName"
                :disabled="!editMode"
                color="neutral"
                variant="subtle"
                class="w-full"
                :ui="treeFieldUi"
              />
            </div>

            <div class="flex flex-col gap-1">
              <p class="text-xs font-semibold uppercase tracking-wider text-muted">
                {{ t('public_persons.create.patronymic') }}
              </p>
              <UInput
                v-model="patronymic"
                :disabled="!editMode"
                color="neutral"
                variant="subtle"
                class="w-full"
                :ui="treeFieldUi"
              />
            </div>

            <div class="flex flex-col gap-1">
              <p class="text-xs font-semibold uppercase tracking-wider text-muted">
                {{ t('public_persons.create.gender') }}
              </p>

              <div
                v-if="editMode"
                class="inline-flex rounded-lg border border-default bg-neutral-900/5"
              >
                <UButton
                  type="button"
                  size="md"
                  :variant="selectedGender === 'MALE' ? 'soft' : 'ghost'"
                  :color="selectedGender === 'MALE' ? 'primary' : 'neutral'"
                  class="px-4 transition-all"
                  @click="selectedGender = 'MALE'"
                >
                  {{ t('public_persons.genders.male') }}
                </UButton>
                <UButton
                  type="button"
                  size="md"
                  :variant="selectedGender === 'FEMALE' ? 'soft' : 'ghost'"
                  :color="selectedGender === 'FEMALE' ? 'primary' : 'neutral'"
                  class="px-4 transition-all"
                  @click="selectedGender = 'FEMALE'"
                >
                  {{ t('public_persons.genders.female') }}
                </UButton>
              </div>

              <UInput
                v-else
                :model-value="genderLabel"
                disabled
                color="neutral"
                variant="subtle"
                class="w-full"
                :ui="treeFieldUi"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted">
              {{ t('public_persons.biography') }}
            </p>
            <UTextarea
              v-model="biography"
              :disabled="!editMode"
              :ui="treeTextareaUi"
              autoresize
              :rows="4"
              color="neutral"
              variant="subtle"
            />
          </div>

          <div
            v-if="editMode"
            class="mt-2 flex flex-col gap-4 rounded-2xl border border-default p-4"
          >
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold uppercase tracking-wider text-muted">
                {{ t('public_persons.avatar.label') }}
              </p>
              <UButton
                type="button"
                color="neutral"
                variant="subtle"
                size="md"
                icon="i-lucide-image"
                @click="avatarFileInput?.click()"
              >
                {{ t('public_persons.avatar.choose') }}
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
              class="relative mx-auto aspect-square w-full max-w-75 overflow-hidden border border-default bg-neutral-900/5"
            >
              <CommonAvatarCropper
                ref="avatarCropper"
                :src="avatarSourceUrl"
                :aspect-ratio="1"
                class="h-full w-full"
              />
            </div>
          </div>

          <div class="flex flex-col gap-4 rounded-2xl border border-default p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm">
                  {{ t('public_persons.tags.title') }}
                </p>
                <p class="text-xs text-muted">
                  {{ t('public_persons.tags.description') }}
                </p>
              </div>

              <UPopover
                v-if="editMode"
                v-model:open="tagsPopoverOpen"
                :popper="{ placement: 'bottom-end' }"
              >
                <UButton
                  variant="subtle"
                  color="neutral"
                  size="sm"
                  icon="i-lucide-plus"
                >
                  {{ t('public_persons.tags.add_button') }}
                </UButton>

                <template #content>
                  <div class="w-72 p-4">
                    <div class="space-y-3">
                      <USelectMenu
                        v-model="selectedTagCode"
                        class="w-full"
                        :items="availableTagOptions"
                        value-key="value"
                        :search-input="false"
                        :placeholder="t('public_persons.tags.select_placeholder')"
                      />

                      <UButton
                        class="w-full justify-center"
                        :disabled="!selectedTagCode"
                        @click="addTag"
                      >
                        {{ t('public_persons.tags.add_button_inner') }}
                      </UButton>

                      <div
                        v-if="tagsLoading"
                        class="space-y-2"
                      >
                        <USkeleton
                          v-for="index in 3"
                          :key="index"
                          class="h-9 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>

            <div
              v-if="tagsText.length"
              class="flex flex-wrap gap-2"
            >
              <button
                v-for="tag in tagsText"
                :key="tag.code ?? tag.name"
                type="button"
                :class="[
                  'group rounded-lg border border-default bg-elevated px-3 py-2 text-left transition-colors',
                  editMode && 'hover:border-error/40 hover:bg-error/5'
                ]"
                :disabled="!editMode"
                @click="removeTag(tag.code)"
              >
                <span class="flex items-center gap-0 text-sm text-highlighted transition-[gap] group-hover:gap-2">
                  <span>{{ tag.name || tag.code }}</span>
                  <UIcon
                    v-if="editMode"
                    name="i-lucide-x"
                    class="size-4 w-0 shrink-0 overflow-hidden opacity-0 transition-all group-hover:w-4 group-hover:opacity-100"
                  />
                </span>
              </button>
            </div>

            <p
              v-else
              class="text-sm text-muted"
            >
              {{ t('public_persons.tags.empty') }}
            </p>
          </div>

          <div
            v-if="events.length"
            class="space-y-3"
          >
            <p class="text-sm font-semibold text-highlighted">
              {{ t('public_persons.events.title') }}
            </p>

            <div class="space-y-2">
              <div
                v-for="event in events"
                :key="event.id"
                class="rounded-xl border border-default px-4 py-3"
              >
                <p class="text-sm font-medium text-highlighted">
                  {{ event.event_type_name || t('public_persons.events.unknown_type') }}
                </p>
                <p class="text-xs text-muted">
                  {{ formatEventDate(event.date_iso, event.date_unknown) }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="mt-4 flex w-full flex-wrap items-center justify-between gap-3">
        <template v-if="!editMode">
          <UButton
            v-if="props.showCreateTreeAction !== false"
            color="neutral"
            variant="soft"
            icon="i-lucide-network"
            :loading="isCreatingTree"
            @click="createTreeFromPerson"
          >
            {{ t('public_persons.actions.create_tree') }}
          </UButton>

          <div class="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
            <UButton
              color="neutral"
              variant="ghost"
              @click="closeModal"
            >
              {{ t('public_persons.actions.close') }}
            </UButton>
            <UButton
              v-if="canEdit"
              color="primary"
              icon="i-lucide-pencil"
              @click="editMode = true"
            >
              {{ t('public_persons.actions.edit') }}
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
            {{ t('public_persons.actions.delete') }}
          </UButton>

          <div class="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
            <UButton
              color="neutral"
              variant="soft"
              @click="closeEditMode"
            >
              {{ t('common.cancel') }}
            </UButton>
            <UButton
              :loading="isSaving"
              color="primary"
              @click="savePerson"
            >
              {{ t('public_persons.actions.save') }}
            </UButton>
          </div>
        </template>
      </div>
    </template>
  </UModal>
</template>
