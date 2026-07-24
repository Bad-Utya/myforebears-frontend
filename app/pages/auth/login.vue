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
  <UMain class="flex">
    <div class="flex flex-col gap-4 m-auto w-lg h-auto">
      <UButton
        color="neutral"
        variant="link"
        icon="i-lucide-arrow-left"
        class="w-fit cursor-pointer"
        @click="$router.back()"
      >
        {{ t('common.back') }}
      </UButton>

      <div class="flex flex-col gap-4 m-auto w-lg h-auto p-4 rounded-xl shadow-lg shadow-carbon-800">
        <div>
          <h1 class="text-left text-3xl font-bold">
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

        <div class="flex flex-row">
          <UButton
            class="w-min"
            loading-auto
            :disabled="!isEmailCorrect"
            :variant="isEmailCorrect ? 'solid' : 'outline'"
            @click="sendRequest()"
          >
            {{ t('common.submit') }}
          </UButton>

          <div class="flex ml-auto gap-0">
            <UButton
              variant="link"
              color="neutral"
              to="./register"
            >
              {{ t('auth.login.no_account') }}
            </UButton>
            <UButton
              variant="link"
              color="neutral"
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
