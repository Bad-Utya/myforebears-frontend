<script setup lang="ts">
import CreateAccountSuggestion from '~/components/common/suggestions/CreateAccountSuggestion.vue'
import PasswordInput from '~/components/auth/PasswordInput.vue'
import sendResetByTokenRequest from '~/services/auth/resetPasswordByToken'
import sendUploadUserAvatarRequest from '~/services/photos/uploadUserAvatar'
import useAppPreferencesHandler from '~/utils/scripts/storages/get/appPreferencesHandler'
import {useUserDataStore} from '~/utils/scripts/storages/create/userData'
import useUserDataHandler from '~/utils/scripts/storages/get/userDataHandler'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import sendUpdateMyNicknameRequest from '~/services/users/updateMyNickname'
import UserAvatar from '~/components/images/avatars/UserAvatar.vue'
import AvatarSettingsModal from "~/components/settings/AvatarSettingsModal.vue";

const { t } = useI18n()

definePageMeta({middleware: 'auth'})

const toast = useToast()
const userDataStore = useUserDataStore()
const {userData, pending, initialized, ensureLoaded} = useUserDataHandler()
const {
  preferences,
  updatePreferences,
  switchTheme,
} = useAppPreferencesHandler()

const isPageLoading = computed(() => pending.value || !initialized.value)
const isGuest = computed(() => initialized.value && !userData.value)

const avatarModalOpen = ref(false)
const isEditingNickname = ref(false)

const nickname = ref('')
const nicknamePending = ref(false)
const password = ref('')
const passwordConfirm = ref('')
const showPasswords = ref(false)
const passwordPending = ref(false)
const avatarPending = ref(false)

const passwordsMatch = computed(() => password.value === passwordConfirm.value)

const languageItems = [
  {key: 'ru', label: 'Ру'},
  {key: 'en', label: 'En'}
] as const

async function saveNickname() {
  if (nicknamePending.value) return
  const normalizedNickname = nickname.value.trim()

  if (!normalizedNickname) {
    toast.add({title: t('notifications.nickname_empty'), color: 'error'})
    return
  }

  nicknamePending.value = true
  try {
    await sendUpdateMyNicknameRequest(normalizedNickname)
    userDataStore.patchUserData({nickname: normalizedNickname})
    isEditingNickname.value = false
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    nicknamePending.value = false
  }
}

async function savePassword() {
  if (passwordPending.value || !password.value) return

  if (password.value !== passwordConfirm.value) {
    toast.add({title: t('notifications.password_mismatch'), color: 'error'})
    return
  }

  passwordPending.value = true
  try {
    await sendResetByTokenRequest(password.value)
    password.value = ''
    passwordConfirm.value = ''
    toast.add({title: t('notifications.password_updated'), color: 'success'})
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    passwordPending.value = false
  }
}

async function onAvatarSave(blob: Blob) {
  avatarPending.value = true
  try {
    const file = new File([blob], 'avatar.png', {type: 'image/png'})
    await sendUploadUserAvatarRequest(file)
    userDataStore.patchUserData({avatarUrl: URL.createObjectURL(file)})
    avatarModalOpen.value = false
  } catch (e) {
    showApiErrorToast(e)
  } finally {
    avatarPending.value = false
  }
}

watch(() => userData.value?.nickname, (nextNickname) => {
  nickname.value = nextNickname ?? ''
}, {immediate: true})

onMounted(async () => {
  await ensureLoaded()
})
</script>

<template>
  <UMain class="flex min-h-dvh px-4 py-6 sm:py-8">
    <UContainer class="m-auto w-full max-w-xl px-0">
      <div class="flex flex-col gap-4">
        <UButton
          color="neutral"
          variant="link"
          icon="i-lucide-arrow-left"
          class="w-fit cursor-pointer px-0"
          @click="$router.back()"
        >
          {{ $t('settings.back') }}
        </UButton>

        <div class="flex flex-col gap-4 rounded-2xl p-4 shadow-xl shadow-carbon-950/50 sm:p-6">
          <div>
            <h1 class="text-left text-2xl font-bold sm:text-3xl">{{ $t('settings.title') }}</h1>
          </div>

          <div v-if="isPageLoading" class="flex flex-col gap-4">
            <USkeleton class="h-32 w-32 rounded-full mx-auto"/>
            <USkeleton class="h-16 rounded-xl" v-for="i in 3" :key="i"/>
          </div>

          <CreateAccountSuggestion
            v-else-if="isGuest"
            compact
            :title="$t('auth.account_required')"
            :description="$t('auth.signin_to_edit')"
          />

          <template v-else>
            <div class="flex justify-center py-2">
              <div
                class="group relative cursor-pointer overflow-hidden rounded-full transition-all"
                @click="avatarModalOpen = true"
              >
                <UserAvatar :user="userData" :size="32"/>
                <div
                  class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <UIcon name="i-lucide-camera" class="h-12 w-12 text-white"/>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <p class="text-sm font-semibold text-muted uppercase tracking-wider">
                {{ $t('settings.nickname') }}
              </p>
              <div class="flex flex-wrap gap-2">
                <UInput
                  v-model="nickname"
                  :disabled="!isEditingNickname"
                  color="neutral"
                  variant="subtle"
                  class="flex-1"
                  @keyup.enter="saveNickname"
                />
                <UButton
                  v-if="!isEditingNickname"
                  variant="subtle" color="neutral" icon="i-lucide-pencil"
                  @click="isEditingNickname = true"
                />

                <div v-else class="flex flex-wrap gap-2">
                  <UButton
                    color="neutral"
                    variant="soft"
                    @click="isEditingNickname = false"
                  >
                    {{ $t('settings.cancel') }}
                  </UButton>
                  <UButton
                    :loading="nicknamePending" color="primary"
                    @click="saveNickname"
                  >
                    {{ $t('settings.save') }}
                  </UButton>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <p class="text-sm font-semibold text-muted uppercase tracking-wider">
                {{ $t('settings.update_password') }}
              </p>
              <section class="flex flex-col gap-2 w-full">
                <div class="flex w-full flex-col gap-2 sm:flex-row sm:items-start">
                  <div class="flex w-full flex-col gap-2 sm:flex-row">
                    <PasswordInput
                      v-model="password"
                      :placeholder="$t('settings.new_password')"
                      :revealed="showPasswords"
                      hide-toggle
                    />
                    <PasswordInput
                      v-model="passwordConfirm"
                      :placeholder="$t('settings.confirm_password')"
                      :revealed="showPasswords"
                      hide-toggle
                    />
                  </div>
                  <UButton
                    type="button"
                    variant="subtle"
                    size="lg"
                    :color="showPasswords ? 'primary' : 'neutral'"
                    :icon="showPasswords ? 'i-lucide-eye' : 'i-lucide-eye-closed'"
                    @click="showPasswords = !showPasswords"
                  />
                </div>

                <div class="flex flex-wrap items-center gap-2 pt-2">
                  <p v-if="!passwordsMatch && passwordConfirm.length > 0" class="text-error text-sm">
                    {{ $t('settings.passwords_dont_match') }}
                  </p>

                  <UButton
                    :loading="passwordPending"
                    :disabled="!passwordsMatch || password.length == 0"
                    class="sm:ml-auto"
                    @click="savePassword"
                  >
                    {{ $t('settings.update_password') }}
                  </UButton>
                </div>
              </section>
            </div>

            <p class="text-sm font-semibold text-muted uppercase tracking-wider">
              {{ $t('settings.preferences') }}
            </p>

            <div class="grid grid-cols gap-4">
              <section class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <p class="text-sm font-medium">{{ $t('settings.theme') }}</p>
                <UColorModeSwitch
                  size="lg"
                  @click="switchTheme"
                />
              </section>

              <section class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <p class="text-sm font-medium">{{ $t('settings.language') }}</p>
                <div class="inline-flex rounded-lg border border-default">
                  <UButton
                    v-for="item in languageItems"
                    :key="item.key"
                    size="sm"
                    :variant="item.key === preferences.language ? 'soft' : 'ghost'"
                    :color="item.key === preferences.language ? 'primary' : 'neutral'"
                    @click="updatePreferences({language: item.key})"
                  >
                    {{ item.label }}
                  </UButton>
                </div>
              </section>
            </div>
          </template>
        </div>
      </div>
    </UContainer>

    <AvatarSettingsModal
      v-model:open="avatarModalOpen"
      :loading="avatarPending"
      @save="onAvatarSave"
    />
  </UMain>
</template>
