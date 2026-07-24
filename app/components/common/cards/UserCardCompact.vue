<script setup lang="ts">
import createAvatarPlaceholder from '~/utils/ui/placeholders/createAvatarPlaceholder'

const { t, locale } = useI18n()

const props = withDefaults(defineProps<{
  pending?: boolean
  userId?: number
  nickname: string
  createdAtUnix?: number
  avatarUrl?: string | null
  href: string
}>(), {
  pending: false,
  userId: undefined,
  createdAtUnix: undefined,
  avatarUrl: null
})

// TODO: remake avatar placeholder
const avatarPlaceholder = computed(() => createAvatarPlaceholder(props.nickname, props.userId))

const registeredLabel = computed(() => {
  if (!props.createdAtUnix) {
    return ''
  }

  return new Intl.DateTimeFormat(locale.value, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(props.createdAtUnix * 1000)
})
</script>

<template>
  <div
    v-if="props.pending"
    class="flex items-center gap-4 rounded-2xl bg-card-bg p-4"
  >
    <USkeleton class="size-16 shrink-0 rounded-full bg-sidebar-skeleton" />
    <div class="min-w-0 flex-1 space-y-2">
      <USkeleton class="h-4 w-32 rounded bg-sidebar-skeleton" />
      <USkeleton class="h-2 w-28 rounded bg-sidebar-skeleton" />
    </div>
  </div>

  <NuxtLink
    v-else
    :to="props.href"
    class="flex items-center gap-4 rounded-2xl bg-card-bg p-4 select-none duration-300 hover:bg-white/6"
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

    <div class="min-w-0 flex flex-col gap-1">
      <p class="truncate text-base font-semibold text-highlighted">
        {{ props.nickname }}
      </p>
      <p
        v-if="registeredLabel"
        class="truncate text-xs text-muted"
      >
        {{ t("users.info_card.registration_date", {date: registeredLabel}) }}
      </p>
    </div>
  </NuxtLink>
</template>

<style scoped>

</style>
