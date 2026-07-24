<script setup lang="ts">
import type EventDTO from '~/services/events/dtos/inner/EventDTO'
import { formatTimelineDate, isApproximateEvent } from '~/utils/timeline/eventFormatters'

const { t } = useI18n()

interface Props {
  events: EventDTO[]
  formatType: (id?: string) => string
  formatPeople: (ids?: string[]) => string
}

defineProps<Props>()
const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div v-if="events.length" class="rounded-xl">
    <p class="text-md font-semibold text-highlighted">
      {{ t('timeline.undated_events_title') }}
    </p>
    <div class="mt-2 flex flex-wrap gap-2">
      <article
        v-for="event in events"
        :key="`undated-${event.id || event.event_id}`"
        class="bg-accented grow group rounded-xl px-4 py-4 duration-300 transition-colors"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-highlighted select-none">
              {{ formatType(event.event_type_id) }}
            </p>
            <p class="mt-1 text-xs text-neutral select-none">
              {{ formatTimelineDate(event) }}
            </p>
            <p class="mt-2 text-xs text-neutral select-none">
              {{ t('timeline.roles.primary') }}: {{ formatPeople(event.primary_person_ids) }}
            </p>
            <p class="mt-1 text-xs text-neutral select-none">
              {{ t('timeline.roles.additional') }}: {{ formatPeople(event.additional_person_ids) }}
            </p>
          </div>
          <div class="flex items-center gap-2 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-pencil"
              @click="emit('edit', event)"
            />
            <UButton
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              @click="emit('delete', event)"
            />
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
