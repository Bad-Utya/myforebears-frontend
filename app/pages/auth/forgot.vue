<script setup lang="ts">
import {ref} from 'vue';
import EmailInput from "~/components/auth/EmailInput.vue";
import sendResetLinkRequest from "~/composables/scripts/auth/sendResetLink";
import showApiErrorToast from "~/composables/scripts/ui/showApiErrorToast";

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
        <UButton color="neutral" variant="link" icon="i-lucide-arrow-left" class="w-fit cursor-pointer" @click="$router.back()">Back
        </UButton>
        <div class="flex flex-col gap-4 m-auto w-lg h-auto p-4 rounded-xl shadow-lg shadow-carbon-800">
          <div>
            <h1 class="text-left text-3xl font-bold">Recover password</h1>
            <p class="text-left text-md text-muted max-w-md">Reset password of the existing account</p>
          </div>

          <div class="flex flex-col gap-2">
            <EmailInput v-model:data="email" v-model:is-right="isEmailCorrect"></EmailInput>
          </div>

            <UButton loading-auto class="w-fit"
                     :disabled="!isEmailCorrect" :variant="isEmailCorrect ? 'solid' : 'outline'"
                     @click="sendRequest()">Submit</UButton>
        </div>

      </div>
    </UMain>
</template>

<style scoped>
</style>
