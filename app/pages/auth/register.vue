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

        <div class="flex flex-row">
          <UButton
            class="w-min"
            loading-auto
            :disabled="!isDataCorrect"
            :variant="isDataCorrect ? 'solid' : 'outline'"
            @click="sendRequest()"
          >
            {{ t('common.submit') }}
          </UButton>

          <UButton
            class="ml-auto"
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
