<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  pending?: boolean
}>()
</script>

<template>
  <div
    v-if="pending"
    class="tree-canvas__loading absolute inset-0 z-5 flex items-center justify-center"
  >
    <div class="flex items-center gap-2 rounded-full bg-elevated px-4 py-2 text-sm text-muted">
      <UIcon
        name="i-lucide-loader-circle"
        class="size-4 animate-spin"
      />
      {{ t('tree.loading') }}
    </div>
  </div>
</template>

<style scoped>
.tree-canvas__loading {
  background: color-mix(in srgb, var(--ui-bg) 70%, transparent 30%);
}
</style>
