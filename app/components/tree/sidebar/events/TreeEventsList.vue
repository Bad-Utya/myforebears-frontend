<script setup lang="ts">
import type EventDTO from '~/services/events/dtos/inner/EventDTO'
import type EventTypeDTO from '~/services/eventTypes/dtos/inner/EventTypeDTO'
import type { EventParticipant } from '~/utils/ui/events/eventParticipants'

const { t } = useI18n()

const props = defineProps<{
  events: EventDTO[]
  eventTypes: EventTypeDTO[]
  participants: EventParticipant[]
  editable: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  create: []
  edit: [event: EventDTO]
  delete: [id: string]
}>()

const personNameMap = computed(() => {
  const map = new Map<string, string>()
  props.participants.forEach((participant) => {
    map.set(participant.id, participant.name || t('tree.events_list.unnamed_person'))
  })
  return map
})

const typeNameMap = computed(() => new Map(props.eventTypes.map(t => [t.id, t.name])))

function getTypeName(typeId?: string) {
  return typeNameMap.value.get(typeId ?? '') ?? t('tree.events_list.unknown_type')
}

function formatParticipants(ids?: string[]) {
  if (!ids?.length) return t('tree.events_list.participants.none')
  return ids.map(id => personNameMap.value.get(id) ?? t('tree.events_list.participants.unknown')).join(', ')
}

function formatEventDate(event: EventDTO) {
  if (event.date_unknown) return t('tree.events_list.dates.unknown')
  if (!event.date_iso) return t('tree.events_list.dates.undated')

  const date = event.date_iso.slice(0, 10)

  const boundKey = event.date_bound?.toLowerCase() as 'before' | 'after' | 'about' | 'exact'
  const prefix = boundKey && boundKey !== 'exact'
    ? t(`tree.events_list.date_bounds.${boundKey}`)
    : ''

  return prefix ? `${prefix} ${date}` : date
}
</script>

<template>
  <section class="rounded-xl border border-default p-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-semibold text-highlighted">
          {{ t('tree.events_list.title') }}
        </p>
        <p class="mt-1 text-xs text-muted">
          {{ t('tree.events_list.description') }}
        </p>
      </div>
      <UButton
        color="neutral"
        variant="soft"
        icon="i-lucide-calendar-plus"
        :disabled="!editable"
        @click="emit('create')"
      >
        {{ t('tree.events_list.add_button') }}
      </UButton>
    </div>

    <div
      v-if="loading"
      class="mt-4 flex flex-col gap-2"
    >
      <USkeleton
        v-for="i in 3"
        :key="i"
        class="h-20 rounded-lg"
      />
    </div>

    <div
      v-else-if="events.length"
      class="mt-4 flex flex-col gap-2"
    >
      <article
        v-for="event in events"
        :key="event.id || event.event_id"
        class="group rounded-lg border border-default bg-tree-panel-item-bg px-3 py-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-highlighted">
              {{ getTypeName(event.event_type_id) }}
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ formatEventDate(event) }}
            </p>

            <div class="mt-2 space-y-0.5">
              <p class="text-[11px] text-muted">
                <span class="font-medium uppercase opacity-70">
                  {{ t('tree.events_list.participants.primary') }}:
                </span>
                {{ formatParticipants(event.primary_person_ids) }}
              </p>
              <p class="text-[11px] text-muted">
                <span class="font-medium uppercase opacity-70">
                  {{ t('tree.events_list.participants.additional') }}:
                </span>
                {{ formatParticipants(event.additional_person_ids) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-pencil"
              size="xs"
              @click="emit('edit', event)"
            />
            <UButton
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              size="xs"
              @click="emit('delete', String(event.id || event.event_id))"
            />
          </div>
        </div>
      </article>
    </div>

    <p
      v-else
      class="mt-4 rounded-lg border border-default bg-tree-panel-item-bg px-3 py-3 text-sm text-muted"
    >
      {{ t('tree.events_list.empty_state') }}
    </p>
  </section>
</template>
