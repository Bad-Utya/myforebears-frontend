<script setup lang="ts">
import {ref} from 'vue';
import EmailInput from "~/components/auth/EmailInput.vue";
import sendResetLinkRequest from "~/services/auth/sendResetLink";
import showApiErrorToast from "~/utils/ui/notifications/showApiErrorToast";

const { t } = useI18n();

definePageMeta({ middleware: 'guest' });

const email = ref('');
const isEmailCorrect = ref(false);

async function sendRequest() {
  try {
    await sendResetLinkRequest(email.value);
  } catch (err) {
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
            {{ t('auth.recovery.title') }}
          </h1>
          <p class="text-left text-md text-muted max-w-md">
            {{ t('auth.recovery.subtitle') }}
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <EmailInput
            v-model:data="email"
            v-model:is-right="isEmailCorrect"
          />
        </div>

        <UButton
          loading-auto
          class="w-full sm:w-fit"
          :disabled="!isEmailCorrect"
          :variant="isEmailCorrect ? 'solid' : 'outline'"
          @click="sendRequest()"
        >
          {{ t('common.submit') }}
        </UButton>
      </div>
    </div>
  </UMain>
</template>
