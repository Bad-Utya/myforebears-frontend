<script setup lang="ts">
import createTreeCardPlaceholder from '~/utils/ui/placeholders/createTreeCardCover'

const props = defineProps<{
  seed?: string
  class?: string
  scale?: number
}>()

const cover = computed(() => createTreeCardPlaceholder(props.seed, props.scale))

// TODO: refactor
</script>

<template>
  <div
    :style="cover.style"
    :class="props.class"
  />
</template>

<style scoped>

</style>
