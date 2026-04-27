<script setup lang="ts">
import AvatarCropper from '~/components/common/AvatarCropper.vue'
import CreateAccountSuggestion from '~/components/common/CreateAccountSuggestion.vue'
import sendResetByTokenRequest from '~/composables/scripts/auth/resetPasswordByToken'
import sendUploadUserAvatarRequest from '~/composables/scripts/photos/uploadUserAvatar'
import { useUserDataStore } from '~/composables/scripts/storages/create/userData'
import useUserDataHandler from '~/composables/scripts/storages/get/userDataHandler'
import createAvatarPlaceholder from '~/composables/scripts/ui/createAvatarPlaceholder'
import showApiErrorToast from '~/composables/scripts/ui/showApiErrorToast'
import sendUpdateMyNicknameRequest from '~/composables/scripts/users/updateMyNickname'

definePageMeta({ middleware: 'auth' })

const toast = useToast()
const fileInput = ref<HTMLInputElement | null>(null)
const avatarCropper = ref<{ exportBlob: (type?: string, size?: number) => Promise<Blob> } | null>(null)
const userDataStore = useUserDataStore()
const { userData, pending, initialized, ensureLoaded } = useUserDataHandler()

const isPageLoading = computed(() => pending.value || !initialized.value)
const isGuest = computed(() => initialized.value && !userData.value)
const displayName = computed(() => userData.value?.nickname ?? 'User')
const avatarPlaceholder = computed(() => createAvatarPlaceholder(displayName.value, userData.value?.id))

const nicknameModalOpen = ref(false)
const passwordModalOpen = ref(false)
const avatarModalOpen = ref(false)

const nickname = ref('')
const nicknamePending = ref(false)
const password = ref('')
const passwordConfirm = ref('')
const passwordPending = ref(false)
const avatarPending = ref(false)
const avatarSourceUrl = ref<string | null>(null)

const themeItems = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' }
] as const

const languageItems = [
  { key: 'ru', label: 'Ru' },
  { key: 'en', label: 'En' }
] as const

function onThemeMockClick() {}
function onLanguageMockClick() {}

function revokeAvatarSourceUrl() {
  if (!avatarSourceUrl.value?.startsWith('blob:')) {
    return
  }

  URL.revokeObjectURL(avatarSourceUrl.value)
}

function resetAvatarEditor() {
  revokeAvatarSourceUrl()
  avatarSourceUrl.value = null

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function openNicknameModal() {
  nickname.value = userData.value?.nickname ?? ''
  nicknameModalOpen.value = true
}

function openPasswordModal() {
  password.value = ''
  passwordConfirm.value = ''
  passwordModalOpen.value = true
}

function openAvatarModal() {
  avatarModalOpen.value = true
}

function closeAvatarModal() {
  avatarModalOpen.value = false
  resetAvatarEditor()
}

async function saveNickname() {
  if (nicknamePending.value) {
    return
  }

  const normalizedNickname = nickname.value.trim()

  if (!normalizedNickname) {
    toast.add({
      title: 'Nickname cannot be empty',
      color: 'error'
    })
    return
  }

  nicknamePending.value = true

  try {
    await sendUpdateMyNicknameRequest(normalizedNickname)
    userDataStore.patchUserData({ nickname: normalizedNickname })
    nicknameModalOpen.value = false
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    nicknamePending.value = false
  }
}

async function savePassword() {
  if (passwordPending.value) {
    return
  }

  if (password.value !== passwordConfirm.value) {
    toast.add({
      title: 'Passwords do not match',
      color: 'error'
    })
    return
  }

  passwordPending.value = true

  try {
    await sendResetByTokenRequest(password.value)
    passwordModalOpen.value = false
    password.value = ''
    passwordConfirm.value = ''
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    passwordPending.value = false
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

async function saveAvatar() {
  if (avatarPending.value || !avatarCropper.value) {
    return
  }

  avatarPending.value = true

  try {
    const blob = await avatarCropper.value.exportBlob('image/png', 512)

    const file = new File([blob], 'avatar.png', { type: 'image/png' })

    await sendUploadUserAvatarRequest(file)

    userDataStore.patchUserData({
      avatarUrl: URL.createObjectURL(file)
    })

    closeAvatarModal()
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    avatarPending.value = false
  }
}

watch(() => userData.value?.nickname, (nextNickname) => {
  nickname.value = nextNickname ?? ''
}, { immediate: true })

watch(avatarModalOpen, (isOpen) => {
  if (!isOpen) {
    resetAvatarEditor()
  }
})

onMounted(async () => {
  await ensureLoaded()
})

onBeforeUnmount(() => {
  resetAvatarEditor()
})
</script>

<template>
  <UMain class="flex">
    <UContainer class="m-auto w-full max-w-3xl px-4 py-8">
      <div class="flex flex-col gap-4">
        <UButton
          color="neutral"
          variant="link"
          icon="i-lucide-arrow-left"
          class="w-fit cursor-pointer px-0"
          @click="$router.back()"
        >
          Back
        </UButton>

        <div class="flex flex-col gap-4 rounded-xl p-4 shadow-lg shadow-carbon-800">
          <div>
            <h1 class="text-left text-3xl font-bold">
              Settings
            </h1>
            <p class="text-left text-md text-muted max-w-md">
              Manage your profile, avatar, and account preferences.
            </p>
          </div>

          <div
            v-if="isPageLoading"
            class="flex flex-col gap-3"
          >
            <USkeleton class="h-16 rounded-xl" />
            <USkeleton class="h-16 rounded-xl" />
            <USkeleton class="h-16 rounded-xl" />
          </div>

          <CreateAccountSuggestion
            v-else-if="isGuest"
            compact
            title="An account is required"
            description="Sign in to edit your profile, avatar, and password."
            button-label="Create account"
          />

          <template v-else>
            <section class="flex items-center gap-4 rounded-xl border border-default px-4 py-3">
              <UAvatar
                v-if="userData?.avatarUrl"
                :src="userData.avatarUrl"
                class="size-14 shrink-0"
              />
              <div
                v-else
                :style="avatarPlaceholder.style"
                class="inline-flex size-14 shrink-0 items-center justify-center rounded-full text-sm font-semibold select-none"
              >
                {{ avatarPlaceholder.label }}
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-sm text-muted">
                  Profile
                </p>
                <p class="truncate font-semibold text-highlighted">
                  {{ userData?.nickname ?? 'No nickname yet' }}
                </p>
              </div>
            </section>

            <section class="flex items-center justify-between gap-4 rounded-xl border border-default px-4 py-3">
              <div>
                <p class="font-medium text-highlighted">
                  Theme
                </p>
                <p class="text-sm text-muted">
                  Mock toggle
                </p>
              </div>

              <div class="inline-flex rounded-lg border border-default p-1">
                <UButton
                  v-for="item in themeItems"
                  :key="item.key"
                  size="xs"
                  color="neutral"
                  :variant="item.key === 'dark' ? 'soft' : 'ghost'"
                  class="px-3"
                  @click="onThemeMockClick"
                >
                  {{ item.label }}
                </UButton>
              </div>
            </section>

            <section class="flex items-center justify-between gap-4 rounded-xl border border-default px-4 py-3">
              <div>
                <p class="font-medium text-highlighted">
                  Language
                </p>
                <p class="text-sm text-muted">
                  Mock toggle
                </p>
              </div>

              <div class="inline-flex rounded-lg border border-default p-1">
                <UButton
                  v-for="item in languageItems"
                  :key="item.key"
                  size="xs"
                  color="neutral"
                  :variant="item.key === 'ru' ? 'soft' : 'ghost'"
                  class="px-3"
                  @click="onLanguageMockClick"
                >
                  {{ item.label }}
                </UButton>
              </div>
            </section>

            <section class="flex items-center justify-between gap-4 rounded-xl border border-default px-4 py-3">
              <div>
                <p class="font-medium text-highlighted">
                  Nickname
                </p>
                <p class="text-sm text-muted">
                  {{ userData?.nickname ?? 'Not set' }}
                </p>
              </div>

              <UButton
                size="sm"
                class="w-min"
                variant="outline"
                @click="openNicknameModal"
              >
                Edit
              </UButton>
            </section>

            <section class="flex items-center justify-between gap-4 rounded-xl border border-default px-4 py-3">
              <div>
                <p class="font-medium text-highlighted">
                  Avatar
                </p>
                <p class="text-sm text-muted">
                  Upload a file and adjust the crop
                </p>
              </div>

              <UButton
                size="sm"
                class="w-min"
                variant="outline"
                @click="openAvatarModal"
              >
                Edit
              </UButton>
            </section>

            <section class="flex items-center justify-between gap-4 rounded-xl border border-default px-4 py-3">
              <div>
                <p class="font-medium text-highlighted">
                  Password
                </p>
                <p class="text-sm text-muted">
                  Update your account password
                </p>
              </div>

              <UButton
                size="sm"
                class="w-min"
                variant="outline"
                @click="openPasswordModal"
              >
                Edit
              </UButton>
            </section>
          </template>
        </div>
      </div>
    </UContainer>

    <UModal
      v-model:open="nicknameModalOpen"
      title="Edit nickname"
      description="Update the public name shown on your profile."
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="saveNickname"
        >
          <UInput
            v-model="nickname"
            color="neutral"
            variant="subtle"
            placeholder="Enter your nickname"
          />

          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="nicknameModalOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              class="w-min"
              :loading="nicknamePending"
            >
              Save
            </UButton>
          </div>
        </form>
      </template>
    </UModal>

    <UModal
      v-model:open="passwordModalOpen"
      title="Change password"
      description="Enter your new password twice."
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="savePassword"
        >
          <UInput
            v-model="password"
            type="password"
            color="neutral"
            variant="subtle"
            placeholder="New password"
          />
          <UInput
            v-model="passwordConfirm"
            type="password"
            color="neutral"
            variant="subtle"
            placeholder="Repeat password"
          />

          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="passwordModalOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              class="w-min"
              :loading="passwordPending"
            >
              Save
            </UButton>
          </div>
        </form>
      </template>
    </UModal>

    <UModal
      v-model:open="avatarModalOpen"
      title="Edit avatar"
      description="Upload an image and adjust the square crop."
    >
      <template #body>
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <UButton
              class="w-min"
              variant="outline"
              @click="fileInput?.click()"
            >
              Choose file
            </UButton>
            <p class="text-sm text-muted">
              The crop area stays inside the editor bounds.
            </p>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleAvatarFileChange"
          >

          <div class="space-y-3 rounded-xl border border-default p-3">
            <div
              class="settings-cropper mx-auto rounded-xl border border-default bg-muted/20"
            >
              <AvatarCropper
                v-if="avatarSourceUrl"
                ref="avatarCropper"
                :src="avatarSourceUrl"
              />
              <div
                v-else
                class="flex h-full min-h-80 items-center justify-center text-sm text-muted"
              >
                Choose an image to start cropping
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="closeAvatarModal"
            >
              Cancel
            </UButton>
            <UButton
              class="w-min"
              :loading="avatarPending"
              :disabled="!avatarSourceUrl"
              @click="saveAvatar"
            >
              Save
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UMain>
</template>

<style scoped>
.settings-cropper {
  width: min(100%, 26rem);
  aspect-ratio: 1 / 1;
  min-height: 20rem;
  overflow: hidden;
}

:deep(.settings-cropper cropper-canvas) {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

:deep(.settings-cropper cropper-selection) {
  max-width: 100%;
  max-height: 100%;
}

:deep(.settings-cropper .vue-advanced-cropper) {
  width: 100%;
  height: 100%;
}
</style>
