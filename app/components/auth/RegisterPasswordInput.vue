<script setup lang="ts">
import getPasswordHardnessLevel from "~/composables/scripts/auth/isPasswordEasy";

const password = defineModel<string>('data');
const isRight = defineModel<boolean>('isRight');

const showPassword = ref(false);

function toggleShowButton() {
  showPassword.value = !showPassword.value;
}

const passwordCheck = computed({
  get() {
    if (!password.value) {
      isRight.value = false;
      return {hardness: 0, hint: ''}
    }

    let dto = getPasswordHardnessLevel(password.value);
    isRight.value = dto.hardness >= 3;

    return dto;
  },
  set(hardness: number) {
    isRight.value = hardness >= 3;
  }

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
               :color="progressColor"/>
    <p v-text="passwordCheck.hint" class="text-sm text-muted"/>
  </div>
</template>

<style scoped>

</style>
