<script setup lang="ts">
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import { useTimelineData, type TimelineTreeKind } from '~/composables/timeline/useTimelineData'
import { useTimelineLayout } from '~/composables/timeline/useTimelineLayout'
import { useTimelineCanvas } from '~/composables/timeline/useTimelineCanvas'
import EventFormModal from '~/components/tree/modals/event/EventFormModal.vue'
import type EventDTO from '~/services/events/dtos/inner/EventDTO'

const props = defineProps<{
  treeId: string
  treeKind: TimelineTreeKind
  backHref: string
}>()

const { t } = useI18n()
const timelineDateFrom = ref('')
const timelineDateTo = ref('')
const timelinePersonIds = ref<string[]>([])
const contentWidth = ref(1400)
const isModalOpen = ref(false)
const currentEvent = ref<EventDTO | null>(null)
const treeIdRef = computed(() => props.treeId)
const treeKindRef = computed(() => props.treeKind)

const {
  pending, events, tree, participants, personOptions,
  personNameById, eventTypeById, loadPageData,
  eventTypes, fetchEvents, removeEvent
} = useTimelineData(treeIdRef, treeKindRef)

const { undatedEvents, positionedEvents, yearMarkers, timelineYears } = useTimelineLayout(
  events,
  { dateFrom: timelineDateFrom, dateTo: timelineDateTo, personIds: timelinePersonIds },
  contentWidth
)

const toast = useToast()
const viewportRef = ref<HTMLElement | null>(null)
const { scale, translateX, isDragging, zoomIn, zoomOut, shift, fitTimeline, startDragging }
  = useTimelineCanvas(viewportRef, contentWidth)

onMounted(async () => {
  try {
    await loadPageData()
    await nextTick()
    fitTimeline(timelineYears.value.length)
  } catch (error) {
    showApiErrorToast(error)
  }
})

watch([timelineYears, timelinePersonIds], () => nextTick(() => fitTimeline(timelineYears.value.length)))

function openEditEventModal(event: EventDTO) {
  currentEvent.value = event
  isModalOpen.value = true
}

async function deleteEvent(event: EventDTO) {
  await removeEvent(event.event_id ?? event.id ?? '')
  const eventTypeName = eventTypeById.value.get(event.event_type_id ?? '')?.name
    || t('timeline.undated_list.unknown_event')

  toast.add({
    title: t('notifications.event_removed'),
    description: t('notifications.event_removed_desc', { type: eventTypeName }),
    icon: 'i-lucide-calendar-days'
  })
}
</script>

<template>
  <UMain class="timeline-page min-h-screen p-4 sm:p-6">
    <div class="mx-auto flex max-w-375 flex-col gap-4">
      <section class="rounded-xl bg-default p-4 shadow-lg shadow-carbon-800 sm:p-6 flex flex-col gap-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-lg font-semibold text-highlighted">
              {{ tree?.name ?? t('timeline.fallback_title') }}
            </p>
            <p class="mt-1 text-sm text-muted">
              {{ timelineYears.length ? `${timelineYears[0]} – ${timelineYears.at(-1)}` : t('timeline.no_dated_events') }}
            </p>
          </div>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            :to="backHref"
          >
            {{ t('common.back') }}
          </UButton>
        </div>

        <div ref="viewportRef">
          <TimelineCanvas
            :pending="pending"
            :content-width="contentWidth"
            :translate-x="translateX"
            :scale="scale"
            :is-dragging="isDragging"
            :year-markers="yearMarkers"
            :positioned-events="positionedEvents"
            :event-type-by-id="eventTypeById"
            :person-name-by-id="personNameById"
            @zoom-in="zoomIn"
            @zoom-out="zoomOut"
            @fit="fitTimeline(timelineYears.length)"
            @shift="shift"
            @pointerdown="startDragging"
          />
        </div>

        <TimelineFilters
          v-model:date-from="timelineDateFrom"
          v-model:date-to="timelineDateTo"
          v-model:selected-person-ids="timelinePersonIds"
          :person-options="personOptions"
        />
        <TimelineUndatedList
          :events="undatedEvents"
          :format-type="(id) => eventTypeById.get(id ?? '')?.name ?? t('timeline.undated_list.unknown_event')"
          :format-people="(ids) => ids?.map(id => personNameById.get(id) ?? id).join(', ') ?? t('timeline.undated_list.none_people')"
          @edit="openEditEventModal"
          @delete="deleteEvent"
        />
      </section>
    </div>

    <EventFormModal
      v-model:open="isModalOpen"
      :event="currentEvent"
      :event-types="eventTypes"
      :participants="participants"
      :tree-id="treeId"
      @saved="fetchEvents"
    />
  </UMain>
</template>

<style scoped>
.timeline-page { background: var(--ui-bg); }
</style>
