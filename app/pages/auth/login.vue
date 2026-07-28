<script setup lang="ts">
import { ref } from 'vue'
import EmailInput from '~/components/auth/EmailInput.vue'
import PasswordInput from '~/components/auth/PasswordInput.vue'
import sendLoginRequest from '~/services/auth/login'
import { persistAuthTokens } from '~/utils/scripts/cookies/getAccessToken'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

const { t } = useI18n()

definePageMeta({ middleware: 'guest' })

const email = ref('')
const password = ref('')
const isEmailCorrect = ref(false)

async function sendRequest() {
  try {
    const result = await sendLoginRequest(email.value, password.value)
    persistAuthTokens({
      access_token: result.accessToken ?? null
    })
    await navigateTo({ path: '/main' })
  } catch (err) {
    showApiErrorToast(err)
  }
}
</script>

<template>
  <UMain class="flex min-h-dvh px-4 py-6 sm:py-8">
    <div class="m-auto flex h-auto w-full max-w-lg flex-col gap-4">
      <UButton
        color="neutral"
        variant="link"
        icon="i-lucide-arrow-left"
        class="w-fit cursor-pointer px-0"
        @click="$router.back()"
      >
        {{ t('common.back') }}
      </UButton>

      <div class="flex h-auto w-full flex-col gap-4 rounded-xl p-4 shadow-lg shadow-carbon-800 sm:p-6">
        <div>
          <h1 class="text-left text-2xl font-bold sm:text-3xl">
            {{ t('auth.login.title') }}
          </h1>
          <p class="text-left text-md text-muted max-w-md">
            {{ t('auth.login.subtitle') }}
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <EmailInput
            v-model:data="email"
            v-model:is-right="isEmailCorrect"
          />
          <PasswordInput v-model="password" />
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <UButton
            class="w-full sm:w-min"
            loading-auto
            :disabled="!isEmailCorrect"
            :variant="isEmailCorrect ? 'solid' : 'outline'"
            @click="sendRequest()"
          >
            {{ t('common.submit') }}
          </UButton>

          <div class="flex flex-col items-start gap-1 sm:ml-auto sm:flex-row sm:items-center sm:gap-2">
            <UButton
              variant="link"
              color="neutral"
              class="px-0 whitespace-nowrap"
              to="./register"
            >
              {{ t('auth.login.no_account') }}
            </UButton>
            <UButton
              variant="link"
              color="neutral"
              class="px-0 whitespace-nowrap"
              to="./forgot"
            >
              {{ t('auth.login.forgot_password') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UMain>
</template>
