<script setup lang="ts">
import {computed, ref} from 'vue';
import sendRegisterRequest from "~/composables/scripts/auth/register";
import type LoginDTO from "~/composables/scripts/auth/dtos/inner/LoginDTO";
import {persistAuthTokens} from "~/composables/scripts/cookies/getAccessToken";

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

const notification = ref("");

async function sendRequest() {
  if (isLoading.value) {
    return;
  }

  // todo refactor notifications
  notification.value = '';

  if (!email.value) {
    notification.value = 'Email is missing';
    return;
  }

  if (!isDataCorrect.value) {
    return;
  }

  isLoading.value = true;

  try {
    const result: LoginDTO = await sendRegisterRequest(email.value, code.value);
    notification.value = result.message ?? '';

    if (result.isSuccessful) {
      persistAuthTokens({
        accessToken: result.accessToken ?? null,
        refreshToken: result.refreshToken ?? null,
      });

      await navigateTo({path: '/main'});
    }
  } catch (err) {
    console.error(err);
    notification.value = 'Failed to send code';
  }

  isLoading.value = false;
}

function sendCodeAgain() {
  tryAgainTimer.value = Date.now();
  timeRemaining.value = DELAY;
}

async function openEmailLink() {
  await navigateTo('/redirect/email', {external: true});
}

onMounted(() => {
  setInterval(() => {
    if (isTryAgainBusy.value) {
      timeRemaining.value = Math.max(0, DELAY - (Date.now() - tryAgainTimer.value));
    }
  }, 1000);
});
</script>

<template>
    <UMain class="flex">
      <div class="flex flex-col gap-4 m-auto w-lg h-auto">
        <UButton color="neutral" variant="link" icon="i-lucide-arrow-left" class="w-fit cursor-pointer"
                 @click="$router.back()">Back
        </UButton>
        <div class="flex flex-col gap-4 m-auto w-lg h-auto p-4 rounded-xl shadow-lg shadow-carbon-800">
          <div>
            <h1 class="text-left text-3xl font-bold">Enter the code</h1>
            <p class="text-left text-md text-muted max-w-md">
              Check
              <UButton color="primary" variant="link" class="font-lighter underline text-md cursor-pointer"
                       @click="openEmailLink()">{{email}}</UButton>
              for the message</p>
          </div>

          <UPinInput v-model="digits" :length="6" class="mx-auto justify-around w-full"
                     variant="subtle" type="number"
                     :ui="{base: 'uppercase text-5xl w-[2ch] h-fit py-[0.5ch] caret-transparent'}"
                     @complete="sendRequest()"/>

          <div class="flex flex-row">
            <UButton class="w-min" :loading="isLoading"
                     :disabled="!isDataCorrect" :variant="isDataCorrect ? 'solid' : 'outline'"
                     @click="sendRequest()">Submit</UButton>
            <UButton class="ml-auto" variant="link" color="neutral" @click="sendCodeAgain()" :disabled="isTryAgainBusy">Send code again</UButton>
            <p class="text-error my-auto" v-if="isTryAgainBusy" v-text="tryAgainFormatted" />
          </div>
        </div>

        <div v-if="notification.length > 0"
             class="flex flex-row gap-2 px-4 py-2 rounded-lg shadow-lg bg-error-800/50 shadow-carbon-800 w-fit">
          <UIcon name="i-lucide-triangle-alert" class="size-8 text-error"/>
          <p v-text="notification" class="text-error text-md font-bold my-auto"></p>
        </div>
      </div>
    </UMain>
</template>

<style scoped>

</style>
