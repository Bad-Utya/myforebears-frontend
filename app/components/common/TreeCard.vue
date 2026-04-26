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
    class="relative overflow-hidden rounded-3xl border border-default bg-neutral/30 aspect-[3/4]"
  >
    <USkeleton class="absolute inset-0" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
    <div class="absolute inset-x-0 bottom-0 p-4 space-y-3">
      <div class="space-y-2">
        <USkeleton class="h-5 w-40 rounded" />
        <USkeleton class="h-3 w-24 rounded" />
        <div class="space-y-1">
          <USkeleton class="h-3 w-full rounded" />
          <USkeleton class="h-3 w-2/3 rounded" />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <USkeleton class="h-4 w-4 rounded" />
        <USkeleton class="h-3 w-10 rounded" />
      </div>
    </div>
  </div>

  <NuxtLink
    v-else
    :to="props.href"
    class="group relative block overflow-hidden rounded-[28px] border border-default bg-muted aspect-[3/4]"
  >
    <TreeCardCover
      v-if="!props.avatar"
      :seed="props.coverSeed ?? props.title"
      class="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.02]"
    />
    <img
      v-if="props.avatar"
      :src="props.avatar"
      :alt="props.title"
      class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      loading="lazy"
    />
    <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

    <div class="absolute inset-x-0 bottom-0 p-4">
      <div class="min-w-0">
        <p class="text-base font-semibold text-white truncate">
          {{ props.title }}
        </p>
        <p v-if="props.author" class="text-xs text-white/70 mt-1 truncate">
          By {{ props.author }}
        </p>
        <p v-if="props.description" class="text-xs text-white/80 mt-3 line-clamp-3">
          {{ props.description }}
        </p>
      </div>

      <div v-if="props.comments" class="mt-4 flex items-center gap-2 text-xs text-white/75">
        <UIcon name="i-lucide-message-circle" class="size-4" />
        <span>{{ props.comments }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>

</style>
