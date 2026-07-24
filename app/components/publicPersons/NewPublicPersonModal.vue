<script setup lang="ts">
import { treeFieldUi, treeTextareaUi } from '~/utils/ui/theme/treeTheme'
import sendCreatePublicPersonRequest from '~/services/publicPersons/createPublicPerson'
import sendUpdatePublicPersonRequest from '~/services/publicPersons/updatePublicPerson'
import sendUploadPublicPersonPhotoRequest from '~/services/publicPersons/uploadPublicPersonPhoto'
import UpdatePublicPersonRequest from '~/services/publicPersons/dtos/requests/UpdatePublicPersonRequest'
import type DataDTO from '~/services/api/dtos/DataDTO'
import type { GetPublicPersonResponse } from '~/services/publicPersons/dtos/responses/GetPublicPersonResponse'
import type PublicPersonDTO from '~/services/publicPersons/dtos/inner/PublicPersonDTO'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

type PublicPersonGender = 'MALE' | 'FEMALE'
type AvatarCropperHandle = {
  exportFile: (fileName?: string, size?: number) => Promise<File | null>
}

const { t } = useI18n()

const isOpen = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  created: [person: PublicPersonDTO]
}>()

const pending = ref(false)
const firstName = ref('')
const lastName = ref('')
const patronymic = ref('')
const biography = ref('')
const gender = ref<PublicPersonGender>('MALE')
const avatarFileInput = ref<HTMLInputElement | null>(null)
const avatarCropper = ref<AvatarCropperHandle | null>(null)
const avatarSourceUrl = ref<string | null>(null)

function resetForm() {
  firstName.value = ''
  lastName.value = ''
  patronymic.value = ''
  biography.value = ''
  gender.value = 'MALE'
  resetAvatarEditor()
}

const isSubmitDisabled = computed(() => {
  return pending.value || !firstName.value.trim()
})

watch(isOpen, (value) => {
  if (!value) {
    resetForm()
  }
})

function revokeUrl() {
  if (avatarSourceUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(avatarSourceUrl.value)
  }
}

function resetAvatarEditor() {
  revokeUrl()
  avatarSourceUrl.value = null

  if (avatarFileInput.value) {
    avatarFileInput.value.value = ''
  }
}

function handleAvatarFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]

  if (!file?.type.startsWith('image/')) {
    return
  }

  revokeUrl()
  avatarSourceUrl.value = URL.createObjectURL(file)
}

async function createPublicPerson() {
  pending.value = true

  try {
    const createResponse = await sendCreatePublicPersonRequest() as DataDTO<GetPublicPersonResponse>
    const createdPerson = createResponse.data?.person

    if (!createdPerson?.id) {
      throw new Error('Public person id is missing')
    }

    const updateResponse = await sendUpdatePublicPersonRequest(
      createdPerson.id,
      new UpdatePublicPersonRequest(
        firstName.value.trim(),
        lastName.value.trim() || undefined,
        patronymic.value.trim() || undefined,
        gender.value,
        biography.value.trim() || undefined
      )
    ) as DataDTO<GetPublicPersonResponse>

    const updatedPerson = updateResponse.data?.person

    if (!updatedPerson) {
      throw new Error('Public person response is missing')
    }

    if (avatarCropper.value) {
      const file = await avatarCropper.value.exportFile('public-person-avatar.png', 512)

      if (file) {
        await sendUploadPublicPersonPhotoRequest(updatedPerson.id ?? createdPerson.id ?? '', file, true)
      }
    }

    emit('created', updatedPerson)
    isOpen.value = false
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="t('public_persons.create.title')"
    :description="t('public_persons.create.description')"
    :ui="{ content: 'bg-default flex max-h-[90dvh] flex-col overflow-y-auto max-w-xl' }"
  >
    <template #body>
      <form
        class="mt-2 flex flex-col gap-5"
        @submit.prevent="createPublicPerson"
      >
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted">
              {{ t('public_persons.create.first_name') }}
            </p>
            <UInput
              v-model="firstName"
              :ui="treeFieldUi"
              color="neutral"
              variant="subtle"
              :placeholder="t('public_persons.create.first_name')"
            />
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted">
              {{ t('public_persons.create.last_name') }}
            </p>
            <UInput
              v-model="lastName"
              :ui="treeFieldUi"
              color="neutral"
              variant="subtle"
              :placeholder="t('public_persons.create.last_name')"
            />
          </div>

          <div class="flex flex-col gap-1 sm:col-span-2">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted">
              {{ t('public_persons.create.patronymic') }}
            </p>
            <UInput
              v-model="patronymic"
              :ui="treeFieldUi"
              color="neutral"
              variant="subtle"
              :placeholder="t('public_persons.create.patronymic')"
            />
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted">
            {{ t('public_persons.create.gender') }}
          </p>

          <div class="inline-flex rounded-lg border border-default bg-card-bg p-1">
            <UButton
              type="button"
              size="sm"
              :variant="gender === 'MALE' ? 'soft' : 'ghost'"
              :color="gender === 'MALE' ? 'primary' : 'neutral'"
              @click="gender = 'MALE'"
            >
              {{ t('public_persons.genders.male') }}
            </UButton>
            <UButton
              type="button"
              size="sm"
              :variant="gender === 'FEMALE' ? 'soft' : 'ghost'"
              :color="gender === 'FEMALE' ? 'primary' : 'neutral'"
              @click="gender = 'FEMALE'"
            >
              {{ t('public_persons.genders.female') }}
            </UButton>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted">
            {{ t('public_persons.create.biography') }}
          </p>
          <UTextarea
            v-model="biography"
            :ui="treeTextareaUi"
            autoresize
            :rows="4"
            color="neutral"
            variant="subtle"
            :placeholder="t('public_persons.create.biography_placeholder')"
          />
        </div>

        <div class="mt-2 flex flex-col gap-4 rounded-2xl border border-default p-4">
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

        <div class="mt-2 flex flex-wrap items-center justify-end gap-2">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            @click="isOpen = false"
          >
            {{ t('common.cancel') }}
          </UButton>
          <UButton
            type="submit"
            color="primary"
            :loading="pending"
            :disabled="isSubmitDisabled"
          >
            {{ t('public_persons.create.submit') }}
          </UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>
