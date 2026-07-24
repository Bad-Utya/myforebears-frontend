<script setup lang="ts">
import RegisterPasswordInput from '~/components/auth/RegisterPasswordInput.vue'
import PasswordInput from '~/components/auth/PasswordInput.vue'
import sendResetByLinkRequest from '~/services/auth/resetPasswordByLink'
import sendResetByTokenRequest from '~/services/auth/resetPasswordByToken'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

const {t} = useI18n()

definePageMeta({middleware: 'guest'})

const route = useRoute()

const password = ref('')
const passwordConfirmation = ref('')
const isPasswordCorrect = ref(false)
const isSubmitting = ref(false)
const isCompleted = ref(false)

const resetLink = computed(() => {
  const rawLink = route.query.link
  return typeof rawLink === 'string' ? rawLink.trim() : ''
})

const resetToken = computed(() => {
  const rawToken = route.query.token
  return typeof rawToken === 'string' ? rawToken.trim() : ''
})

const hasResetCredentials = computed(() => {
  return Boolean(resetLink.value || resetToken.value || (import.meta.client && window.location.href))
})

const isConfirmationCorrect = computed(() => {
  return passwordConfirmation.value.length > 0 && passwordConfirmation.value === password.value
})

const canSubmit = computed(() => {
  return isPasswordCorrect.value && isConfirmationCorrect.value && hasResetCredentials.value
})
const helperText = computed(() => {
  if (!hasResetCredentials.value) {
    return t('auth.reset.helpers.no_credentials')
  }

  if (!passwordConfirmation.value.length) {
    return t('auth.reset.helpers.repeat_new')
  }

  if (!isConfirmationCorrect.value) {
    return t('auth.reset.helpers.mismatch')
  }

  return t('auth.reset.helpers.set_new')
})

async function sendRequest() {
  if (isSubmitting.value || !canSubmit.value) return

  isSubmitting.value = true
  try {
    if (resetToken.value) {
      await sendResetByTokenRequest(password.value)
    } else {
      const currentLink = resetLink.value || (import.meta.client ? window.location.href : '')
      await sendResetByLinkRequest(currentLink, password.value)
    }
    isCompleted.value = true
  } catch (err: unknown) {
    showApiErrorToast(err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UMain class="flex min-h-screen px-4">
    <div class="m-auto flex w-full max-w-lg flex-col gap-4">
      <UButton
        color="neutral"
        variant="link"
        icon="i-lucide-arrow-left"
        class="w-fit cursor-pointer"
        @click="$router.back()"
      >
        {{ t('common.back') }}
      </UButton>

      <div class="flex flex-col gap-4 rounded-xl p-4 shadow-lg shadow-carbon-800">
        <div>
          <h1 class="text-left text-3xl font-bold">
            {{ t('auth.reset.title') }}
          </h1>
          <p class="text-left text-md text-muted max-w-md">
            {{ isCompleted ? t('auth.reset.success_subtitle') : t('auth.reset.subtitle') }}
          </p>
        </div>

        <div v-if="!isCompleted" class="flex flex-col gap-4">
          <RegisterPasswordInput v-model:data="password" v-model:is-right="isPasswordCorrect"/>

          <div class="flex flex-col gap-2">
            <PasswordInput
              v-model="passwordConfirmation"
              :placeholder="t('auth.reset.placeholders.repeat_password')"
            />
            <p
              class="text-sm"
              :class="isConfirmationCorrect || !passwordConfirmation.length ? 'text-muted' : 'text-error'"
            >
              {{ helperText }}
            </p>
          </div>
        </div>

        <UAlert
          v-else
          color="success"
          variant="subtle"
          icon="i-lucide-badge-check"
          :title="t('auth.reset.alert.title')"
          :description="t('auth.reset.alert.description')"
        />

        <div class="flex flex-row items-center gap-2">
          <UButton
            v-if="!isCompleted"
            class="w-min"
            :loading="isSubmitting"
            :disabled="!canSubmit"
            :variant="canSubmit ? 'solid' : 'outline'"
            @click="sendRequest"
          >
            {{ t('common.submit') }}
          </UButton>

          <UButton
            class="ml-auto"
            variant="link"
            color="neutral"
            to="./login"
          >
            {{ t('auth.reset.go_to_login') }}
          </UButton>
        </div>
      </div>
    </div>
  </UMain>
</template>
