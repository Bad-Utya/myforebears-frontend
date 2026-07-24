<script setup lang="ts">
const props = defineProps<{
  scale: number
  pending?: boolean
  hasNodes: boolean
}>()

const emit = defineEmits<{
  zoomIn: []
  zoomOut: []
  fitToView: []
  updateScale: [value: number]
}>()
</script>

<template>
  <div
    class="absolute bottom-4 right-4 z-10 flex items-center gap-2 border border-default rounded-2xl bg-neutral p-2 backdrop-blur-lg max-w-52"
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
