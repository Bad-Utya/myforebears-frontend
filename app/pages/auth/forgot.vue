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
          class="w-fit"
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
