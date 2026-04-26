<script setup lang="ts">
import createTreeCardCover from "~/composables/scripts/ui/createTreeCardCover";

const props = defineProps<{
  seed?: string;
  class?: string;
}>();

const cover = computed(() => createTreeCardCover(props.seed));
</script>

<template>
  <div :style="cover.style" :class="props.class" />
</template>

<style scoped>

</style>
