<script setup lang="ts">
import { computed, ref } from 'vue'
import createAvatarPlaceholder from '~/utils/ui/placeholders/createAvatarPlaceholder'

interface User {
  nickname?: string
  email?: string
  avatarUrl?: string
  id?: number
}

interface Props {
  user: User | null
  size?: number
  class?: string
}

const props = defineProps<Props>()
const imgError = ref(false)

const displayName = computed(() => props.user?.nickname?.trim() || props.user?.email?.trim() || 'User')
const placeholder = computed(() => createAvatarPlaceholder(displayName.value, props.user?.id ?? -1))

const size = computed(() => props.size ?? 12)
const textSize = computed(() => size.value < 16 ? 'sm' : '2xl')
const sizeClass = computed(() => `w-${size.value} h-${size.value} text-${textSize.value}`)
</script>

<template>
  <template v-if="props.user?.avatarUrl && !imgError">
    <img
      :src="props.user.avatarUrl"
      :alt="displayName"
      :class="`${sizeClass} rounded-full object-cover ${props.class ?? ''}`"
      @error="imgError = true"
    >
  </template>
  <div
    v-else
    :style="placeholder.style"
    :class="`${sizeClass} flex shrink-0 items-center justify-center font-semibold uppercase rounded-full select-none ${props.class ?? ''}`"
  >
    {{ placeholder.label }}
  </div>
</template>
