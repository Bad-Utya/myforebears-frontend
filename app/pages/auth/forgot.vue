<script setup lang="ts">
import {ref} from 'vue';
import EmailInput from "~/components/auth/EmailInput.vue";
import sendResetLinkRequest from "~/composables/scripts/auth/sendResetLink";
import type StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";

const email = ref('');

const isEmailCorrect = ref(false);

const notification = ref("");

function sendRequest() {
  sendResetLinkRequest(email.value)
    .then((result: StatusDTO) => {
      // sucksucksuck abbanabnajen
    })
    .catch((err) => {
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
