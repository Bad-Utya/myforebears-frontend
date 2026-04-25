<script setup lang="ts">
import useUserDataHandler from "~/composables/scripts/storages/get/userDataHandler";

const {userData, pending, ensureLoaded} = useUserDataHandler();

onMounted(async () => {
  await ensureLoaded();
});
</script>

// https://ui.nuxt.com/docs/components/sidebar
<template>
  <div class="flex items-center gap-4">
  <template v-if="pending">
    <USkeleton class="size-12 shrink-0 rounded-full"></USkeleton>
    <div class="w-full flex flex-col gap-y-2">
      <USkeleton class="h-4 w-full"></USkeleton>
      <USkeleton class="h-4 w-3/4"></USkeleton>
    </div>
  </template>
  <template v-else>
    <UAvatar :src="userData?.avatarUrl" class="size-12 shrink-0" />
    <div class="min-w-0 flex flex-col">
      <p class="text-sm font-semibold text-highlighted truncate">
        {{ userData?.username ?? 'User' }}
      </p>
      <p class="text-xs text-muted truncate">
        {{ userData?.email ?? '' }}
      </p>
    </div>
  </template>
  </div>
</template>

<style scoped>

</style>
