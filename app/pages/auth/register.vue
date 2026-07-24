<script setup lang="ts">
import { ref, computed } from 'vue'; // Не забывай импортировать computed, если он не авто-импортится
import sendCodeRequest from '~/services/auth/sendCode';
import RegisterPasswordInput from "~/components/auth/RegisterPasswordInput.vue";
import EmailInput from "~/components/auth/EmailInput.vue";
import showApiErrorToast from "~/utils/ui/notifications/showApiErrorToast";

const { t } = useI18n();

definePageMeta({ middleware: 'guest' });

const email = ref('');
const password = ref('');

const isPasswordCorrect = ref(false);
const isEmailCorrect = ref(false);

const isDataCorrect = computed(() => isPasswordCorrect.value && isEmailCorrect.value);

async function sendRequest() {
  try {
    await sendCodeRequest(email.value, password.value);
    await navigateTo({ path: '/auth/code', query: { email: email.value } });
  } catch (err: unknown) {
    showApiErrorToast(err);
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
            {{ t('auth.register.title') }}
          </h1>
          <p class="text-left text-md text-muted max-w-md">
            {{ t('auth.register.subtitle') }}
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <EmailInput
            v-model:data="email"
            v-model:is-right="isEmailCorrect"
          />
          <RegisterPasswordInput
            v-model:data="password"
            v-model:is-right="isPasswordCorrect"
          />
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <UButton
            class="w-full sm:w-min"
            loading-auto
            :disabled="!isDataCorrect"
            :variant="isDataCorrect ? 'solid' : 'outline'"
            @click="sendRequest()"
          >
            {{ t('common.submit') }}
          </UButton>

          <UButton
            class="px-0 sm:ml-auto"
            variant="link"
            color="neutral"
            to="./login"
          >
            {{ t('auth.register.already_have_account') }}
          </UButton>
        </div>
      </div>
    </div>
  </UMain>
</template>
