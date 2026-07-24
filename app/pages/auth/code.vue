<script setup lang="ts">
import {computed, ref} from 'vue';
import sendRegisterRequest from "~/services/auth/register";
import {persistAuthTokens} from "~/utils/scripts/cookies/getAccessToken";
import showApiErrorToast from "~/utils/ui/notifications/showApiErrorToast";
import getLinkByEmail from "~/utils/scripts/redirect/email/getLinkByEmail";

const { t } = useI18n();

definePageMeta({ middleware: 'guest' });

const MILLISECONDS_IN_MINUTE = 60000;
const DELAY = MILLISECONDS_IN_MINUTE;

const route = useRoute();
const email = computed(() => (Array.isArray(route.query.email) ? route.query.email[0] : route.query.email) ?? '');

const digits = ref<number[]>([]);
const code = computed(() => digits.value.map(String).join(''));

const tryAgainTimer = ref(Date.now() - DELAY);
const timeRemaining = ref(0);
const isLoading = ref(false);

const tryAgainFormatted = computed(() => {
  const minutes = Math.floor(timeRemaining.value / MILLISECONDS_IN_MINUTE);
  const seconds = Math.floor((timeRemaining.value % MILLISECONDS_IN_MINUTE) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const isTryAgainBusy = computed(() => timeRemaining.value > 0);
const isDataCorrect = computed(() => (digits.value.length === 6 && !digits.value.includes(undefined!)));

async function sendRequest() {
  if (isLoading.value) return;

  if (!email.value) {
    showApiErrorToast({
      code: 'email_missing',
      message: t('notifications.email_missing'), // Локализованная ошибка
    });
    return;
  }

  if (!isDataCorrect.value) return;

  isLoading.value = true;
  try {
    const result = await sendRegisterRequest(email.value, code.value);
    persistAuthTokens({ access_token: result.accessToken ?? null });
    await navigateTo({path: '/main'});
  } catch (err) {
    showApiErrorToast(err);
  } finally {
    isLoading.value = false;
  }
}

function sendCodeAgain() {
  tryAgainTimer.value = Date.now();
  timeRemaining.value = DELAY;
  // Тут можно добавить вызов API для повторной отправки
}

async function openEmailLink() {
  await navigateTo(getLinkByEmail(email.value), {external: true});
}

onMounted(() => {
  const interval = setInterval(() => {
    if (isTryAgainBusy.value) {
      timeRemaining.value = Math.max(0, DELAY - (Date.now() - tryAgainTimer.value));
    }
  }, 1000);

  onUnmounted(() => clearInterval(interval));
});
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
            {{ t('auth.verify_code.title') }}
          </h1>
          <p class="text-left text-md text-muted max-w-md">
            <!-- Используем интерполяцию для вставки кнопки с email внутрь текста -->
            <i18n-t keypath="auth.verify_code.subtitle" scope="global">
              <template #email>
                <UButton
                  color="primary"
                  variant="link"
                  class="p-0 font-lighter underline text-md cursor-pointer"
                  @click="openEmailLink()"
                >
                  {{ email }}
                </UButton>
              </template>
            </i18n-t>
          </p>
        </div>

        <UPinInput
          v-model="digits"
          :length="6"
          class="mx-auto justify-around w-full"
          variant="subtle"
          type="number"
          :ui="{base: 'uppercase text-5xl w-[2ch] h-fit py-[0.5ch] caret-transparent'}"
          @complete="sendRequest()"
        />

        <div class="flex flex-row">
          <UButton
            class="w-min"
            :loading="isLoading"
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
            @click="sendCodeAgain()"
            :disabled="isTryAgainBusy"
          >
            {{ t('auth.verify_code.send_again') }}
          </UButton>

          <p class="text-error my-auto" v-if="isTryAgainBusy" v-text="tryAgainFormatted" />
        </div>
      </div>
    </div>
  </UMain>
</template>
