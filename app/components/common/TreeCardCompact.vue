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
    class="relative flex gap-3 p-3 rounded-2xl border border-default bg-neutral/40"
  >
    <div class="relative flex-none w-23 h-23 rounded-xl overflow-hidden">
      <USkeleton class="absolute inset-0" />
    </div>

    <div class="min-w-0 flex flex-col justify-between py-0.5 w-full">
      <div class="min-w-0 space-y-2">
        <USkeleton class="h-4 w-40 rounded" />
        <p class="text-xs text-muted truncate">
          By username
        </p>
        <USkeleton class="h-3 w-28 rounded" />
      </div>
    </div>
  </div>

  <NuxtLink
    v-else
    :to="props.href"
    class="group relative flex gap-3 p-3 rounded-2xl border border-default bg-neutral/40 hover:bg-neutral/55 transition-colors"
  >
    <div class="relative flex-none w-23 h-23 rounded-xl overflow-hidden bg-muted">
      <TreeCardCover
        v-if="!props.avatar"
        :seed="props.coverSeed ?? props.title"
        class="absolute inset-0"
      />
      <img
        v-if="props.avatar"
        :src="props.avatar"
        :alt="props.title"
        class="w-full h-full object-cover"
        loading="lazy"
      />
    </div>

    <div class="min-w-0 flex flex-col justify-between py-0.5">
      <div class="min-w-0">
        <p class="text-sm font-semibold text-highlighted truncate">{{ props.title }}</p>
        <p v-if="props.author" class="text-xs text-muted mt-0.5 truncate">By {{ props.author }}</p>
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
