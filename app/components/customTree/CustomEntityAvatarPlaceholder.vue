<script setup lang="ts">
import createAvatarPlaceholder from '~/utils/ui/placeholders/createAvatarPlaceholder'

const props = withDefaults(defineProps<{
  name?: string
  entityId?: string
  size?: number
  class?: string
}>(), {
  name: undefined,
  entityId: undefined,
  size: 12,
  class: undefined
})

const placeholder = computed(() => createAvatarPlaceholder(props.name, props.entityId))
const initials = computed(() => {
  const parts = props.name?.trim().split(/\s+/).filter(Boolean) ?? []

  if (!parts.length) return '??'

  return parts
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
})
const dimension = computed(() => `${props.size * 0.25}rem`)
</script>

<template>
  <div
    class="flex shrink-0 select-none items-center justify-center rounded-full font-semibold uppercase"
    :class="props.class"
    :style="{
      ...placeholder.style,
      width: dimension,
      height: dimension
    }"
  >
    {{ initials }}
  </div>
</template>
