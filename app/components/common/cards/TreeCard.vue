<script setup lang="ts">
// TODO: comments??
// TODO: amount of trees to render
import TreeCardCover from "~/components/images/avatars/TreeCardCover.vue";

const props = withDefaults(defineProps<{
  pending?: boolean
  title: string
  author?: string
  description?: string
  avatar: string
  coverSeed?: string
  comments?: string
  href: string
}>(), {
  pending: false
})
</script>

<template>
  <div
    v-if="props.pending"
    class="relative overflow-hidden rounded-3xl bg-card-bg aspect-3/4"
  >
    <USkeleton class="w-full h-full" />
    <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
    <div class="absolute inset-x-0 bottom-0 p-4 space-y-2">
      <USkeleton class="h-6 w-40 rounded" />
      <USkeleton class="h-4 w-24 rounded" />
      <USkeleton class="h-4 w-28 rounded" />
    </div>
  </div>

  <NuxtLink
    v-else
    :to="props.href"
    draggable="false"
    class="relative block aspect-3/4 overflow-hidden rounded-3xl border border-default
    transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-[0.97] select-none"
  >

    <TreeCardCover
      :src="props.avatar"
      :seed="props.coverSeed ?? props.title"
      class="absolute inset-0"
    />

    <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

    <div class="absolute inset-x-0 bottom-0 p-4">
      <div class="min-w-0">
        <p class="text-base font-semibold text-white truncate">
          {{ props.title }}
        </p>
        <p
          v-if="props.author?.trim()"
          class="text-xs text-white/70 mt-0 truncate"
        >
          {{ props.author }}
        </p>
        <p
          v-if="props.description"
          class="text-xs text-white/80 mt-2 line-clamp-3"
        >
          {{ props.description }}
        </p>
      </div>

      <div
        v-if="props.comments"
        class="mt-4 flex items-center gap-2 text-xs text-white/75"
      >
        <UIcon
          name="i-lucide-message-circle"
          class="size-4"
        />
        <span>{{ props.comments }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>

</style>
