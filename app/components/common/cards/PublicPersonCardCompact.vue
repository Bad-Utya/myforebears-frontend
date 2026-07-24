<script setup lang="ts">
import TreePersonAvatar from '~/components/images/avatars/TreePersonAvatar.vue'
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
}>(), {
  pending: false,
  avatarUrl: null
})

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
    class="relative flex h-28 gap-4 rounded-2xl bg-card-bg p-4"
  >
    <USkeleton class="size-16 shrink-0 rounded-full bg-sidebar-skeleton" />

    <div class="min-w-0 flex flex-col justify-between py-2 w-full">
      <div class="min-w-0 space-y-2">
        <USkeleton class="h-4 w-40 rounded bg-sidebar-skeleton" />
        <USkeleton class="h-2 w-24 rounded bg-sidebar-skeleton" />
        <USkeleton class="h-2 w-32 rounded bg-sidebar-skeleton" />
        <USkeleton class="h-2 w-28 rounded bg-sidebar-skeleton" />
      </div>
    </div>
  </div>

  <button
    v-else
    type="button"
    class="flex h-28 w-full items-center gap-4 rounded-2xl bg-card-bg p-4 text-left select-none duration-300 hover:bg-white/6"
  >
    <TreePersonAvatar
      :person="{ first_name: props.fullName, gender: props.gender }"
      :avatar-url="props.avatarUrl ?? undefined"
      :size="16"
    />

    <div class="min-w-0 flex flex-col justify-between py-1">
      <div class="min-w-0">
        <p class="text-sm font-semibold text-highlighted truncate">
          {{ props.fullName }}
        </p>
        <p
          v-if="subtitle"
          class="text-xs text-muted mt-0 truncate"
        >
          {{ subtitle }}
        </p>
        <p
          v-if="props.tagsText"
          class="text-[11px] text-toned mt-1 line-clamp-1"
        >
          {{ props.tagsText }}
        </p>
        <p
          v-if="props.biography"
          class="mt-2 line-clamp-1 text-xs text-toned"
        >
          {{ props.biography }}
        </p>
      </div>
    </div>
  </button>
</template>
