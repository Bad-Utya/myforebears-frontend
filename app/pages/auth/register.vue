<script setup lang="ts">
import {ref} from 'vue';
import sendRegisterRequest from '~/composables/scripts/auth/register';
import RegisterPasswordInput from "~/components/auth/RegisterPasswordInput.vue";
import EmailInput from "~/components/auth/EmailInput.vue";
import type StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";

const email = ref('');
const password = ref('');

const isPasswordCorrect = ref(false);
const isEmailCorrect = ref(false);

const isDataCorrect = computed(() => isPasswordCorrect.value && isEmailCorrect.value);

const notification = ref("");

async function sendRequest() {
  await sendRegisterRequest(email.value, password.value)
    .then((result: StatusDTO) => {
      // TODO: move
      notification.value = result.message ?? '';

      if (result.isSuccessful) {
        navigateTo({path:'/auth/code', query: {email: email.value}});
      } else {
        // notification.value = result.message ?? '';
      }
    })
    .catch((err: any) => {
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
            <h1 class="text-left text-3xl font-bold">Register</h1>
            <p class="text-left text-md text-muted max-w-md">Create a new account</p>
          </div>

          <div class="flex flex-col gap-2">
            <EmailInput v-model:data="email" v-model:is-right="isEmailCorrect"></EmailInput>
            <RegisterPasswordInput v-model:data="password" v-model:is-right="isPasswordCorrect"></RegisterPasswordInput>
          </div>

          <div class="flex flex-row">
            <UButton class="w-min" loading-auto
                     :disabled="!isDataCorrect" :variant="isDataCorrect ? 'solid' : 'outline'"
                     @click="sendRequest()">Submit</UButton>
            <UButton class="ml-auto" variant="link" color="neutral" to="./login">Already have an account, login instead</UButton>
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
