<script setup lang="ts">
import TreePersonAvatar from '~/components/images/avatars/TreePersonAvatar.vue'
import type { PublicPersonCardItem } from '~/utils/ui/publicPersons/mapPublicPersonToCardItem'
import { normalizePublicPersonGender } from '~/utils/ui/publicPersons/publicPersonHelpers'

const props = defineProps<{
  item: PublicPersonCardItem
  loading?: boolean
}>()

const emit = defineEmits<{
  import: [item: PublicPersonCardItem]
  info: [item: PublicPersonCardItem]
}>()

const { t } = useI18n()

const subtitle = computed(() => {
  const parts: string[] = []
  const normalizedGender = normalizePublicPersonGender(props.item.gender)

  if (normalizedGender === 'MALE') {
    parts.push(t('public_persons.genders.male'))
  } else if (normalizedGender === 'FEMALE') {
    parts.push(t('public_persons.genders.female'))
  }

  if (props.item.birthYear) {
    parts.push(props.item.birthYear)
  }

  return parts.join(' · ')
})
</script>

<template>
  <div class="group rounded-2xl border border-default px-4 py-3 transition-colors hover:bg-elevated">
    <div class="flex items-center gap-4">
      <TreePersonAvatar
        :person="{ first_name: props.item.fullName, gender: props.item.gender }"
        :avatar-url="props.item.avatarUrl ?? undefined"
        :size="16"
      />

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-highlighted">
          {{ props.item.fullName }}
        </p>
        <p
          v-if="subtitle"
          class="truncate text-xs text-muted"
        >
          {{ subtitle }}
        </p>
        <p
          v-if="props.item.tagsText"
          class="mt-1 line-clamp-1 text-[11px] text-toned"
        >
          {{ props.item.tagsText }}
        </p>
      </div>

      <div class="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-info"
          @click.stop="emit('info', props.item)"
        />
        <UButton
          color="primary"
          variant="ghost"
          icon="i-lucide-plus"
          :loading="props.loading"
          @click.stop="emit('import', props.item)"
        />
      </div>
    </div>
  </div>
</template>
