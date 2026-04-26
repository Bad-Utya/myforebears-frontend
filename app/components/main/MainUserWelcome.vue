<script setup lang="ts">
import useUserDataHandler from "~/composables/scripts/storages/get/userDataHandler";
import createAvatarPlaceholder from "~/composables/scripts/ui/createAvatarPlaceholder";

const {userData, pending, initialized, ensureLoaded} = useUserDataHandler();

const displayName = computed(() => userData.value?.nickname ?? userData.value?.email ?? 'User');
const avatarPlaceholder = computed(() => createAvatarPlaceholder(displayName.value, userData.value?.id));
const isLoading = computed(() => pending.value || !initialized.value);
const isGuest = computed(() => initialized.value && !userData.value);

onMounted(async () => {
  await ensureLoaded();
});
</script>

<template>
  <div v-if="isGuest" class="space-y-2">
    <p class="text-left text-sm text-muted">Welcome,</p>
    <p class="text-left text-xl font-semibold truncate">
      Guest visitor
    </p>
  </div>

  <div v-else class="space-y-2">
    <p class="text-left text-sm text-muted">Welcome back,</p>

    <div v-if="isLoading" class="flex items-center gap-3">
      <USkeleton class="size-10 rounded-full" />
      <USkeleton class="h-5 w-40 rounded" />
    </div>

    <div v-else class="flex gap-3 items-center min-w-0">
      <UAvatar v-if="userData?.avatarUrl" :src="userData.avatarUrl" class="size-10 shrink-0" />
      <div
        v-else
        :style="avatarPlaceholder.style"
        class="size-10 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold select-none"
      >
        {{ avatarPlaceholder.label }}
      </div>

      <p class="text-left text-xl font-semibold truncate">
        {{ displayName }}
      </p>
    </div>
  </div>
</template>

<style scoped>

</style>
