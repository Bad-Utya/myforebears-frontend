<script setup lang="ts">
import useUserDataHandler from "~/composables/scripts/storages/get/userDataHandler";
import createAvatarPlaceholder from "~/composables/scripts/ui/createAvatarPlaceholder";

const {userData, pending, initialized, ensureLoaded} = useUserDataHandler();
const displayName = computed(() => userData.value?.nickname ?? userData.value?.email ?? 'Unknown user');
const avatarPlaceholder = computed(() => createAvatarPlaceholder(displayName.value, userData.value?.id));
const isLoading = computed(() => pending.value || !initialized.value);

onMounted(async () => {
  await ensureLoaded();
});
</script>

// https://ui.nuxt.com/docs/components/sidebar
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
    <UAvatar v-if="userData?.avatarUrl" :src="userData.avatarUrl" class="size-12 shrink-0" />
    <div
      v-else
      :style="avatarPlaceholder.style"
      class="size-12 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold select-none"
    >
      {{ avatarPlaceholder.label }}
    </div>
    <div class="min-w-0 flex flex-col">
      <p class="text-sm font-semibold text-highlighted truncate">
        {{ displayName }}
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
