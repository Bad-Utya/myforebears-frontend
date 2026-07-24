<script setup lang="ts">
import type EventTypeDTO from '~/services/eventTypes/dtos/inner/EventTypeDTO'

const { t } = useI18n()

const props = defineProps<{
  eventTypes: EventTypeDTO[]
  editable: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  create: []
  delete: [id: string]
}>()

function formatPeopleRule(eventType: EventTypeDTO) {
  const count = eventType.primary_persons_count ?? 0
  const mode = eventType.primary_persons_mode ?? ''

  if (mode.includes('UNLIMITED')) {
    return count > 0 ? `${count}+` : t('tree.event_types.rules.any')
  }
  if (mode.includes('AT_LEAST')) {
    return `${count}+`
  }
  if (mode.includes('EXACT')) {
    return String(count)
  }

  return count > 0 ? String(count) : t('tree.event_types.rules.any')
}
</script>

<template>
  <section class="rounded-xl border border-default p-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-semibold text-highlighted">
          {{ t('tree.event_types.title') }}
        </p>
        <p class="mt-1 text-xs text-muted">
          {{ t('tree.event_types.description') }}
        </p>
      </div>
      <UButton
        color="neutral"
        variant="subtle"
        icon="i-lucide-badge-plus"
        :disabled="!editable"
        @click="emit('create')"
      >
        {{ t('tree.event_types.add_button') }}
      </UButton>
    </div>

    <div v-if="loading" class="mt-4 flex flex-col gap-2">
      <USkeleton class="h-16 rounded-lg" v-for="i in 2" :key="i" />
    </div>

    <div v-else-if="eventTypes.length" class="mt-4 flex flex-col gap-2">
      <article
        v-for="eventType in eventTypes"
        :key="eventType.id"
        class="group flex items-center justify-between gap-2 rounded-lg border border-default bg-tree-panel-item-bg px-3 py-2"
      >
        <div class="min-w-0">
          <p class="truncate text-sm text-highlighted">
            {{ eventType.name || t('tree.event_types.unnamed_type') }}
          </p>
          <p class="text-xs text-muted">
            {{ t('tree.event_types.people_count', { count: formatPeopleRule(eventType) }) }}
          </p>
        </div>
        <UButton
          color="error"
          variant="ghost"
          icon="i-lucide-trash-2"
          class="opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
          :disabled="!editable || !eventType.id"
          @click="eventType.id && emit('delete', eventType.id)"
        />
      </article>
    </div>

    <p v-else class="mt-4 rounded-lg border border-default bg-tree-panel-item-bg px-3 py-3 text-sm text-muted">
      {{ t('tree.event_types.empty_state') }}
    </p>
  </section>
</template>
