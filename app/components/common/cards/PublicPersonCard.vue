<script setup lang="ts">
import createTreeCardCover from '~/utils/ui/placeholders/createTreeCardCover'
import { normalizePublicPersonGender } from '~/utils/ui/publicPersons/publicPersonHelpers'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  pending?: boolean
  fullName: string
  birthYear?: string
  gender?: string
  biography?: string
  tagsText?: string
  avatarUrl?: string | null
  seed?: string
}>(), {
  pending: false,
  avatarUrl: null
})

const placeholder = computed(() => createTreeCardCover(props.seed ?? props.fullName))

const subtitle = computed(() => {
  const parts: string[] = []

  if (normalizePublicPersonGender(props.gender) === 'MALE') {
    parts.push(t('public_persons.genders.male'))
  } else if (normalizePublicPersonGender(props.gender) === 'FEMALE') {
    parts.push(t('public_persons.genders.female'))
  } else if (props.gender) {
    parts.push(t('public_persons.genders.unspecified'))
  }

  if (props.birthYear) {
    parts.push(props.birthYear)
  }

  return parts.join(' · ')
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
      <USkeleton class="h-4 w-36 rounded" />
      <USkeleton class="h-4 w-28 rounded" />
    </div>
  </div>

  <button
    v-else
    type="button"
    class="relative block aspect-3/4 w-full overflow-hidden rounded-3xl border border-default text-left transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-[0.97] select-none"
  >
    <img
      v-if="props.avatarUrl"
      :src="props.avatarUrl"
      :alt="props.fullName"
      class="absolute inset-0 h-full w-full object-cover"
    >

    <div
      v-else
      :style="placeholder.style"
      class="absolute inset-0"
    />

    <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

    <div class="absolute inset-x-0 bottom-0 p-4">
      <div class="min-w-0">
        <p class="text-base font-semibold text-white truncate">
          {{ props.fullName }}
        </p>
        <p
          v-if="subtitle"
          class="text-xs text-white/70 mt-0 truncate"
        >
          {{ subtitle }}
        </p>
        <p
          v-if="props.tagsText"
          class="text-[11px] text-white/70 mt-1 line-clamp-1"
        >
          {{ props.tagsText }}
        </p>
        <p
          v-if="props.biography"
          class="text-xs text-white/80 mt-2 line-clamp-3"
        >
          {{ props.biography }}
        </p>
      </div>
    </div>
  </button>
</template>
