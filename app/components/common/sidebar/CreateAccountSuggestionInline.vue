<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="w-full">
    <div class="flex mx-auto gap-4 flex-row w-fit">
      <UButton
        color="primary"
        variant="soft"
        icon="i-lucide-user-round-plus"
        to="/auth/register"
      >
        {{ t('auth.actions.sign_up') }}
      </UButton>
      <UButton
        color="neutral"
        variant="ghost"
        to="/auth/login"
      >
        {{ t('auth.actions.log_in') }}
      </UButton>
    </div>
  </div>
</template>

<style scoped>
</style>
