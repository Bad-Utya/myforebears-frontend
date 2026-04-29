<script setup lang="ts">
import TreeCardCover from "~/components/common/TreeCardCover.vue";

const props = withDefaults(defineProps<{
  pending?: boolean;
  title: string;
  author?: string;
  description?: string;
  avatar: string;
  coverSeed?: string;
  comments?: string;
  href: string;
}>(), {
  pending: false,
});
</script>

<template>
  <div
    v-if="props.pending"
    class="relative flex gap-3 rounded-2xl border border-default bg-card-bg p-3"
  >
    <div class="relative aspect-3/4 w-20 flex-none overflow-hidden rounded-2xl bg-card-bg">
      <USkeleton class="absolute inset-0 bg-[var(--sidebar-skeleton)]" />
    </div>

    <div class="min-w-0 flex flex-col justify-between py-0.5 w-full">
      <div class="min-w-0 space-y-2">
        <USkeleton class="h-4 w-40 rounded bg-[var(--sidebar-skeleton)]" />
        <USkeleton class="h-3 w-24 rounded bg-[var(--sidebar-skeleton)]" />
        <USkeleton class="h-3 w-28 rounded bg-[var(--sidebar-skeleton)]" />
      </div>
    </div>
  </div>

  <NuxtLink
    v-else
    :to="props.href"
    class="group relative flex gap-3 rounded-2xl border border-default bg-card-bg p-3 transition-colors duration-200 ease-out hover:bg-white/6"
  >
    <div class="relative aspect-3/4 w-20 flex-none overflow-hidden rounded-xl bg-card-bg">
      <TreeCardCover
        v-if="!props.avatar"
        :seed="props.coverSeed ?? props.title"
        :scale="0.5"
        class="absolute inset-0 transition-transform duration-300"
      />
      <img
        v-if="props.avatar"
        :src="props.avatar"
        :alt="props.title"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-300"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />
    </div>

    <div class="min-w-0 flex flex-col justify-between py-0.5">
      <div class="min-w-0">
        <p class="text-sm font-semibold text-highlighted truncate">{{ props.title }}</p>
        <p v-if="props.author?.trim()" class="text-xs text-muted mt-0 truncate">By {{ props.author }}</p>
        <p v-if="props.description" class="text-xs text-toned mt-2 line-clamp-2 max-h-10 overflow-hidden">
          {{ props.description }}
        </p>
      </div>

      <div v-if="props.comments" class="flex items-center gap-1.5 text-xs text-muted mt-2">
        <UIcon name="i-lucide-message-circle" class="size-4" />
        <span>{{ props.comments }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>

</style>
