<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  treeName: string
}>()
</script>

<template>
  <div class="absolute inset-0 flex items-center justify-center p-6">
    <div class="px-6 py-5 text-center">
      <p class="text-sm text-muted">
        {{ t('tree.empty_state', { name: treeName }) }}
      </p>
    </div>
  </div>
</template>
