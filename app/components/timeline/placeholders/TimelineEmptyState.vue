<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="absolute inset-0 flex items-center justify-center p-6">
    <div class="px-6 py-5 text-center">
      <p class="text-sm text-muted">
        {{ t('timeline.no_content') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
</style>
