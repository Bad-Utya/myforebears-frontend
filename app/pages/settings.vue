<script setup lang="ts">
import AvatarCropper from '~/components/common/AvatarCropper.vue'
import CreateAccountSuggestion from '~/components/common/CreateAccountSuggestion.vue'
import PasswordInput from '~/components/auth/PasswordInput.vue'
import sendResetByTokenRequest from '~/composables/scripts/auth/resetPasswordByToken'
import sendUploadUserAvatarRequest from '~/composables/scripts/photos/uploadUserAvatar'
import useAppPreferencesHandler from '~/composables/scripts/storages/get/appPreferencesHandler'
import { useUserDataStore } from '~/composables/scripts/storages/create/userData'
import useUserDataHandler from '~/composables/scripts/storages/get/userDataHandler'
import createAvatarPlaceholder from '~/composables/scripts/ui/createAvatarPlaceholder'
import showApiErrorToast from '~/composables/scripts/ui/showApiErrorToast'
import sendUpdateMyNicknameRequest from '~/composables/scripts/users/updateMyNickname'

definePageMeta({ middleware: 'auth' })

const toast = useToast()
const fileInput = ref<HTMLInputElement | null>(null)
const avatarCropper = ref<{ exportBlob: (type?: string, size?: number) => Promise<Blob> } | null>(null)
const colorMode = useColorMode()
const userDataStore = useUserDataStore()
const { userData, pending, initialized, ensureLoaded } = useUserDataHandler()
const {
  language,
  ensureLoaded: ensureAppPreferencesLoaded,
  setLanguage
} = useAppPreferencesHandler()

const isPageLoading = computed(() => pending.value || !initialized.value)
const isGuest = computed(() => initialized.value && !userData.value)
const displayName = computed(() => userData.value?.nickname ?? 'User')
const registeredLabel = computed(() => {
  const createdAtUnix = userData.value?.created_at_unix

  if (!createdAtUnix) {
    return 'Registration date unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(createdAtUnix * 1000)
})
const avatarPlaceholder = computed(() => createAvatarPlaceholder(displayName.value, userData.value?.id))

const nicknameModalOpen = ref(false)
const passwordModalOpen = ref(false)
const avatarModalOpen = ref(false)

const nickname = ref('')
const nicknamePending = ref(false)
const password = ref('')
const passwordConfirm = ref('')
const showPasswords = ref(false)
const passwordPending = ref(false)
const avatarPending = ref(false)
const avatarSourceUrl = ref<string | null>(null)

const languageItems = [
  { key: 'ru', label: 'Ru' },
  { key: 'en', label: 'En' }
] as const

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
  showPasswords.value = false
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
  ensureAppPreferencesLoaded()
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
            <section class="flex items-center gap-4 rounded-xl border border-default bg-settings-section-bg px-4 py-3">
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
                <p class="truncate font-semibold text-highlighted">
                  {{ userData?.nickname ?? 'No nickname yet' }}
                </p>
                <p class="truncate text-sm text-muted">
                  {{ userData?.email ?? 'Email unavailable' }}
                </p>
                <p class="truncate text-xs text-muted">
                  Joined {{ registeredLabel }}
                </p>
              </div>
            </section>

            <section class="flex items-center justify-between gap-4 rounded-xl border border-default px-4 py-3">
              <div>
                <p class="font-medium text-highlighted">
                  Theme
                </p>
                <p class="text-sm text-muted">
                  {{ colorMode.value === 'dark' ? 'Dark' : 'Light' }}
                </p>
              </div>

              <UColorModeSwitch
                size="sm"
                color="primary"
              />
            </section>

            <section class="flex items-center justify-between gap-4 rounded-xl border border-default px-4 py-3">
              <div>
                <p class="font-medium text-highlighted">
                  Language
                </p>
                <p class="text-sm text-muted">
                  {{ language === 'ru' ? 'Russian' : 'English' }}
                </p>
              </div>

              <div class="inline-flex rounded-lg border border-default p-1">
                <UButton
                  v-for="item in languageItems"
                  :key="item.key"
                  size="xs"
                  color="primary"
                  :variant="item.key === language ? 'soft' : 'ghost'"
                  class="px-3"
                  @click="setLanguage(item.key)"
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
      :ui="{
        content: 'bg-default flex flex-col focus:outline-none'
      }"
    >
      <template #body>
        <form
          class="mx-auto flex w-full max-w-xl flex-col items-stretch gap-4"
          @submit.prevent="saveNickname"
        >
          <UInput
            v-model="nickname"
            color="neutral"
            variant="subtle"
            placeholder="Enter your nickname"
            size="lg"
            class="w-full"
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
      :ui="{
        content: 'bg-default flex flex-col focus:outline-none'
      }"
    >
      <template #body>
        <form
          class="mx-auto flex w-full max-w-3xl flex-col items-stretch gap-4"
          @submit.prevent="savePassword"
        >
          <div class="flex items-stretch gap-3">
            <PasswordInput
              v-model="password"
              placeholder="New password"
              :revealed="showPasswords"
              hide-toggle
              class="flex-1"
            />
            <UButton
              type="button"
              variant="subtle"
              :icon="showPasswords ? 'i-lucide-eye' : 'i-lucide-eye-closed'"
              :color="showPasswords ? 'primary' : 'neutral'"
              class="shrink-0"
              @click="showPasswords = !showPasswords"
            />
            <PasswordInput
              v-model="passwordConfirm"
              placeholder="Repeat password"
              :revealed="showPasswords"
              hide-toggle
              class="w-full"
            />
          </div>

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
    >
      <template #body>
        <div class="space-y-4">
          <div>
            <UButton
              class="w-fit"
              variant="outline"
              @click="fileInput?.click()"
            >
              Choose file
            </UButton>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleAvatarFileChange"
          >

          <div class="space-y-3 rounded-xl border border-default bg-settings-section-bg p-3">
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
