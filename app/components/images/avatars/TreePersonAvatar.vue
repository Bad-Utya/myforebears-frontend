<script setup lang="ts">
import { computed, ref } from 'vue'

interface Person {
  first_name?: string
  last_name?: string
  gender?: string
}

interface Props {
  person: Person
  size?: number
  class?: string
  avatarUrl?: string
}

const { t } = useI18n();

const props = defineProps<Props>()
const imgError = ref(false)

const fullName = computed(() => {
  const parts = [props.person.first_name, props.person.last_name].filter(Boolean)
  return parts.length ? parts.join(' ') : t('tree.person.unknown')
})

const initials = computed(() =>
  fullName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
)

const sizeClass = computed(() => {
  const s = props.size ?? 16
  return `w-${s} h-${s} text-base`
})

// TODO: refactor css styles
const bgStyle = computed(() => {
  switch (props.person.gender) {
    case 'GENDER_MALE':
      return {
        backgroundColor: 'var(--color-tree-node-male-avatar-bg)',
        color: 'var(--color-tree-node-male-avatar-text)'
      }
    case 'GENDER_FEMALE':
      return {
        backgroundColor: 'var(--color-tree-node-female-avatar-bg)',
        color: 'var(--color-tree-node-female-avatar-text)'
      }
    default:
      return {
        backgroundColor: 'var(--color-tree-node-unspecified-avatar-bg)',
        color: 'var(--color-tree-node-unspecified-avatar-text)'
      }
  }
})
</script>

<template>
  <template v-if="props.avatarUrl && !imgError">
    <img
      :src="props.avatarUrl"
      :alt="fullName"
      :class="`${sizeClass} rounded-full object-cover ${props.class}`"
      @error="imgError = true"
    >
  </template>
  <div
    v-else
    :style="bgStyle"
    :class="`${sizeClass} shrink-0 flex items-center justify-center font-bold uppercase rounded-full select-none ${props.class}`"
  >
    {{ initials }}
  </div>
</template>
