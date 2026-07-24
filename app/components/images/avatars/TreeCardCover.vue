<script setup lang="ts">
import { computed, ref } from 'vue'
import TreeCardPlaceholder from '~/components/images/placeholders/TreeCardPlaceholder.vue'

const props = defineProps<{
  src?: string
  seed?: string
  class?: string
  scale?: number
}>()

const imgError = ref(false)

const useImage = computed(() => props.src && !imgError.value)
</script>

<template>
  <template v-if="useImage">
    <img
      :src="props.src"
      :alt="'Card cover'"
      class="w-full h-full object-cover rounded-xl"
      loading="lazy"
      @error="imgError = true"
    >
  </template>

  <TreeCardPlaceholder
    v-else
    :seed="props.seed"
    :scale="props.scale"
    class="absolute inset-0"
  />
</template>
