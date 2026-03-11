<script setup lang="ts">
import isEmailCorrect from "~/composables/scripts/auth/isEmailCorrect";

const email = defineModel<string>('data');
const isRight = defineModel<boolean>('isRight');

const checkEmail = computed({
  get() {
    if (!email.value) {
      isRight.value = false;
      return true;
    }

    const valid = isEmailCorrect(email.value);
    isRight.value = valid;
    return valid;
  },
  set(v: boolean) {
    isRight.value = v
  }
})
</script>

<template>
  <UInput type="text" v-model="email" :color="checkEmail ? 'neutral' : 'error'" variant="subtle"
          placeholder="Email"></UInput>
</template>

<style scoped>

</style>
