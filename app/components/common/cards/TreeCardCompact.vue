<script setup lang="ts">
import TreeCardCover from '~/components/images/avatars/TreeCardCover.vue'

const props = withDefaults(defineProps<{
  pending?: boolean
  title: string
  author?: string
  tagsText?: string
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
    class="relative flex gap-4 rounded-2xl bg-card-bg p-4"
  >
    <div class="relative aspect-3/4 w-20 flex-none overflow-hidden rounded-2xl bg-card-bg">
      <USkeleton class="absolute inset-0 bg-sidebar-skeleton" />
    </div>

    <div class="min-w-0 flex flex-col justify-between py-2 w-full">
      <div class="min-w-0 space-y-2">
        <USkeleton class="h-4 w-40 rounded bg-sidebar-skeleton" />
        <USkeleton class="h-2 w-24 rounded bg-sidebar-skeleton" />
        <USkeleton class="h-2 w-32 rounded bg-sidebar-skeleton" />
        <USkeleton class="h-2 w-28 rounded bg-sidebar-skeleton" />
      </div>
    </div>
  </div>

  <NuxtLink
    v-else
    :to="props.href"
    class="flex gap-4 rounded-2xl bg-card-bg p-4 select-none duration-300 hover:bg-white/6"
  >
    <div class="relative aspect-3/4 w-20 flex-none overflow-hidden rounded-xl bg-card-bg">
      <TreeCardCover
        :src="props.avatar"
        :seed="props.coverSeed ?? props.title"
        :scale="0.4"
        class="absolute inset-0"
      />
      <div class="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />
    </div>

    <div class="min-w-0 flex flex-col justify-between py-1">
      <div class="min-w-0">
        <p class="text-sm font-semibold text-highlighted truncate">{{ props.title }}</p>
        <p
          v-if="props.author?.trim()"
          class="text-xs text-muted mt-0 truncate"
        >{{ props.author }}</p>
        <p
          v-if="props.tagsText"
          class="mt-1 line-clamp-2 break-words text-[11px] text-toned"
        >
          {{ props.tagsText }}
        </p>
        <p
          v-if="props.description"
          class="text-xs text-toned mt-2 line-clamp-2 max-h-10 overflow-hidden"
        >
          {{ props.description }}
        </p>
      </div>

      <div
        v-if="props.comments"
        class="flex items-center gap-1.5 text-xs text-muted mt-2"
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
