<script setup lang="ts">
import { computed } from 'vue'

interface AvatarPlaceholderProps {
  label: string
  style?: Record<string, string>
  size?: string | number
  class?: string
}

const props = defineProps<AvatarPlaceholderProps>()

const containerClass = computed(() => [
  'inline-flex items-center justify-center rounded-full select-none font-semibold',
  props.size ? `w-${props.size} h-${props.size}` : 'w-12 h-12',
  props.class ?? ''
])
</script>

<template>
  <div
    :style="props.style"
    :class="containerClass"
  >
    {{ props.label }}
  </div>
</template>

