<script setup lang="ts">
import isEmailCorrect from "~/utils/scripts/filters/isEmailCorrect";

const { t } = useI18n();

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
  <UInput
    type="text"
    v-model="email"
    :color="checkEmail ? 'neutral' : 'error'"
    variant="subtle"
    :placeholder="t('auth.placeholders.email')"
  />
</template>

<style scoped>
</style>
