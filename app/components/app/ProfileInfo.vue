<script setup lang="ts">
const isLoading = ref(true);

function getData() {
  isLoading.value = true;

  // load

  isLoading.value = false;
}
</script>

<template>
  <div class="flex items-center gap-4">
  <template v-if="isLoading">
    <USkeleton class="size-12 shrink-0 rounded-full"></USkeleton>
    <div class="w-full flex flex-col gap-y-2">
      <USkeleton class="h-4 w-full"></USkeleton>
      <USkeleton class="h-4 w-3/4"></USkeleton>
    </div>
  </template>
  <template v-else>

  </template>
  </div>
</template>

<style scoped>

</style>
