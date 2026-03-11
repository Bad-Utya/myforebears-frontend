<script setup lang="ts">
import getPasswordHardnessLevel from "~/composables/scripts/auth/isPasswordEasy";

const password = ref('');
const passwordConfirm = ref('');
const showPassword = ref(false);

function toggleShowButton() {
  showPassword.value = !showPassword.value;

  console.log(passwordCheck)
};

const passwordCheck = computed(() => {
  if (!password.value) {
    return { hardness: 0, hint: '' }
  }

  return getPasswordHardnessLevel(password.value);
});

const progressColor = computed(() => {
  switch (passwordCheck.value.hardness) {
    case 0:
      return 'neutral'
    case 1:
      return 'error'
    case 2:
      return 'error'
    case 3:
      return 'warning'
    case 4:
      return 'success'
    default:
      return 'neutral'
  }
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row gap-2">
      <UInput v-model="password" color="neutral" variant="subtle" placeholder="Password" class="w-full"
              :type="showPassword ? 'text' : 'password'"
              ></UInput>
      <UButton variant="subtle"
               :icon="showPassword ? 'i-lucide-eye' : 'i-lucide-eye-closed'"
               :color="showPassword ? 'primary' : 'neutral'"
               @click="toggleShowButton()"/>
    </div>
  <UProgress v-model="passwordCheck.hardness" :max="4"
             :color="progressColor" />
    <p v-text="passwordCheck.hint" class="text-sm text-muted" />

    <UInput v-model="passwordConfirm"
            :type="showPassword ? 'text' : 'password'" v-if="password.length > 0 || passwordConfirm.length > 0"
            :color="passwordConfirm.length > 0 && password !== passwordConfirm ? 'error' : 'neutral'" variant="subtle"
            placeholder="Repeat password"></UInput>
  </div>
</template>

<style scoped>

</style>
