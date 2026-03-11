<script setup lang="ts">
import { ref } from 'vue';
import { sendRegisterRequest } from '~/composables/scripts/auth/register';
import isEmailCorrect from "~/composables/scripts/auth/isEmailCorrect";
import RegisterPasswordInput from "~/components/auth/RegisterPasswordInput.vue";

const code = ref('WAITING...');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const showPassword = ref(false);

function sendData() {
  sendRegisterRequest(email.value, password.value)
    .then((result) => {
      code.value = result.code;
    })
    .catch((err) => {
      code.value = 'ERROR';
      console.error(err);
    });
}

function checkEmail(email: string): boolean {
  return isEmailCorrect(email);
}
</script>

<template>
  <UApp>
    <UMain class="flex">
      <div class="flex flex-col gap-4 m-auto w-lg h-auto">
        <UButton color="neutral" variant="link" icon="i-lucide-arrow-left" to="../../home">To home</UButton>
      <div class="flex flex-col gap-4 m-auto w-lg h-auto p-4 rounded-xl shadow-lg shadow-carbon-800">
        <div>
        <h1 class="text-left text-3xl font-bold">Register</h1>
        <p class="text-left text-md text-muted max-w-md">Create a new account</p>
        </div>

        <div class="flex flex-col gap-2">
        <UInput type="text" v-model="email" color="neutral" variant="subtle" placeholder="Email"></UInput>
          <RegisterPasswordInput></RegisterPasswordInput>
        </div>

        <div class="flex flex-row">
        <UButton class="w-min">Submit</UButton>
        <UButton class="ml-auto" variant="link" color="neutral">Forgot password</UButton>
        </div>
      </div>
      </div>
    </UMain>
  </UApp>
</template>

<style scoped>
</style>
