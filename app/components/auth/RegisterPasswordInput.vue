<script setup lang="ts">
import getPasswordHardnessLevel from "~/composables/scripts/auth/isPasswordEasy";
import PasswordInput from "~/components/auth/PasswordInput.vue";

const password = defineModel<string>('data');
const isRight = defineModel<boolean>('isRight');

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
    <PasswordInput v-model="password" />
    <UProgress v-model="passwordCheck.hardness" :max="4"
               :color="progressColor"/>
    <p v-text="passwordCheck.hint" class="text-sm text-muted"/>
  </div>
</template>

<style scoped>

</style>
