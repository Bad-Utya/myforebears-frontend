<script setup lang="ts">
import createAvatarPlaceholder from "~/composables/scripts/ui/createAvatarPlaceholder";

const props = withDefaults(defineProps<{
  pending?: boolean;
  userId?: number;
  nickname: string;
  createdAtUnix?: number;
  avatarUrl?: string | null;
  href: string;
}>(), {
  pending: false,
  userId: undefined,
  createdAtUnix: undefined,
  avatarUrl: null,
});

const avatarPlaceholder = computed(() => createAvatarPlaceholder(props.nickname, props.userId));

const registeredLabel = computed(() => {
  if (!props.createdAtUnix) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(props.createdAtUnix * 1000);
});
</script>

<template>
  <div
    v-if="props.pending"
    class="flex min-h-32 items-center gap-4 rounded-2xl border border-default bg-neutral/40 p-4"
  >
    <USkeleton class="size-16 shrink-0 rounded-full" />
    <div class="min-w-0 flex-1 space-y-2">
      <USkeleton class="h-4 w-32 rounded" />
      <USkeleton class="h-3 w-28 rounded" />
      <USkeleton class="h-8 w-24 rounded-xl" />
    </div>
  </div>

  <NuxtLink
    v-else
    :to="props.href"
    class="group flex min-h-32 items-center gap-4 rounded-2xl border border-default bg-neutral/40 p-4 transition-colors hover:bg-neutral/55"
  >
    <UAvatar
      v-if="props.avatarUrl"
      :src="props.avatarUrl"
      class="size-16 shrink-0"
    />
    <div
      v-else
      :style="avatarPlaceholder.style"
      class="inline-flex size-16 shrink-0 items-center justify-center rounded-full text-lg font-semibold select-none"
    >
      {{ avatarPlaceholder.label }}
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate text-base font-semibold text-highlighted">
        {{ props.nickname }}
      </p>
      <p v-if="registeredLabel" class="mt-1 truncate text-xs text-muted">
        Joined {{ registeredLabel }}
      </p>
      <div class="mt-3">
        <span class="inline-flex items-center rounded-full border border-default px-2.5 py-1 text-xs text-toned">
          View profile
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>

</style>
