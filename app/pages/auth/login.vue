<script setup lang="ts">
import {ref} from 'vue';
import EmailInput from "~/components/auth/EmailInput.vue";
import PasswordInput from "~/components/auth/PasswordInput.vue";
import sendLoginRequest from "~/composables/scripts/auth/login";
import type LoginDTO from "~/composables/scripts/auth/dtos/inner/LoginDTO";
import {persistAuthTokens} from "~/composables/scripts/cookies/getAccessToken";

const email = ref('');
const password = ref('');

const isEmailCorrect = ref(false);

const notification = ref("");

function sendRequest() {
  sendLoginRequest(email.value, password.value)
    .then((result: LoginDTO) => {
      notification.value = result.message ?? '';

      if (result.isSuccessful) {
        persistAuthTokens({
          accessToken: result.accessToken ?? null,
          refreshToken: result.refreshToken ?? null,
        });

        navigateTo({path:'/main'});
      } else {
        // notification.value = result.message ?? '';
      }
    })
    .catch((err) => {
      // no success
      console.error(err);
    });
}
</script>

<template>
    <UMain class="flex">
      <div class="flex flex-col gap-4 m-auto w-lg h-auto">
        <UButton color="neutral" variant="link" icon="i-lucide-arrow-left" class="w-fit cursor-pointer" @click="$router.back()">Back
        </UButton>
        <div class="flex flex-col gap-4 m-auto w-lg h-auto p-4 rounded-xl shadow-lg shadow-carbon-800">
          <div>
            <h1 class="text-left text-3xl font-bold">Login</h1>
            <p class="text-left text-md text-muted max-w-md">Welcome back</p>
          </div>

          <div class="flex flex-col gap-2">
            <EmailInput v-model:data="email" v-model:is-right="isEmailCorrect"></EmailInput>
            <PasswordInput v-model="password" />
          </div>

          <div class="flex flex-row">
            <UButton class="w-min" loading-auto
                     :disabled="!isEmailCorrect" :variant="isEmailCorrect ? 'solid' : 'outline'"
                     @click="sendRequest()">Submit</UButton>
            <div class="flex ml-auto gap-0">
            <UButton class="" variant="link" color="neutral" to="./forgot">I don't have an account</UButton>
            <UButton class="" variant="link" color="neutral" to="./forgot">Forgot password</UButton>
            </div>
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
