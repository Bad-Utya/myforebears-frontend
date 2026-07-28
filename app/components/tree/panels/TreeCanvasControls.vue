<script setup lang="ts">
const { t } = useI18n()

withDefaults(defineProps<{
  scale: number
  pending?: boolean
  hasNodes: boolean
  actionsVisible?: boolean
  canToggleActions?: boolean
}>(), {
  actionsVisible: true,
  canToggleActions: false
})

const emit = defineEmits<{
  zoomIn: []
  zoomOut: []
  fitToView: []
  toggleActions: []
  updateScale: [value: number]
}>()
</script>

<template>
  <div
    class="absolute bottom-4 right-4 z-10 flex max-w-64 items-center gap-2 rounded-2xl border border-default bg-neutral p-2 backdrop-blur-lg"
  >
    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-minus"
      :disabled="pending"
      @click="emit('zoomOut')"
    />

    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-scan-search"
      :disabled="pending || !hasNodes"
      @click="emit('fitToView')"
    />

    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-plus"
      :disabled="pending"
      @click="emit('zoomIn')"
    />

    <UButton
      v-if="canToggleActions"
      color="neutral"
      variant="ghost"
      :icon="actionsVisible ? 'i-lucide-eye' : 'i-lucide-eye-off'"
      :aria-label="actionsVisible ? t('tree.canvas.hide_actions') : t('tree.canvas.show_actions')"
      :title="actionsVisible ? t('tree.canvas.hide_actions') : t('tree.canvas.show_actions')"
      :disabled="pending"
      @click="emit('toggleActions')"
    />

    <UInputNumber
      :model-value="scale"
      :increment="false"
      :decrement="false"
      class="w-16"
      :ui="{
        base: 'text-center text-neutral'
      }"
      color="neutral"
      variant="ghost"
      :min="0.3"
      :max="1.6"
      :step="0.01"
      :format-options="{
        style: 'percent'
      }"
      @update:model-value="emit('updateScale', $event ?? 1)"
    />
  </div>
</template>
