<script setup lang="ts">
import type EventTypeDTO from '~/services/eventTypes/dtos/inner/EventTypeDTO'
import TimelineControlsPanel from "~/components/timeline/panels/TimelineControlsPanel.vue";
import TimelineEmptyState from "~/components/timeline/placeholders/TimelineEmptyState.vue";
import TimelineLoadingPanel from "~/components/timeline/panels/TimelineLoadingPanel.vue";

const { t } = useI18n()

interface Props {
  pending: boolean
  contentWidth: number
  translateX: number
  scale: number
  isDragging: boolean
  yearMarkers: Array<{ year: number; leftPx: number }>
  positionedEvents: any[]
  eventTypeById: Map<string, EventTypeDTO>
  personNameById: Map<string, string>
}

const props = defineProps<Props>()

const isEmpty = computed(() => !props.pending && props.positionedEvents.length === 0)

const emit = defineEmits<{
  (e: 'zoomIn'): void
  (e: 'zoomOut'): void
  (e: 'fit'): void
  (e: 'shift', direction: number): void
  (e: 'pointerdown', event: PointerEvent): void
}>()

const getEventTypeName = (id?: string) =>
  props.eventTypeById.get(id ?? '')?.name ?? t('timeline.unknown_event')

const getPeopleNames = (ids?: string[]) =>
  ids?.map(id => props.personNameById.get(id) ?? id).join(', ') ?? t('timeline.no_people')

const handleWheel = (event: WheelEvent) => {
  if (event.deltaY < 0) {
    emit('zoomIn')
  } else {
    emit('zoomOut')
  }
}
</script>

<template>
  <div
    @wheel.prevent="handleWheel"
    class="relative overflow-hidden rounded-xl border border-default bg-default"
    :class="{ 'cursor-grabbing': isDragging, 'cursor-grab': !isDragging }"
    @pointerdown="emit('pointerdown', $event)"
  >
    <div class="absolute inset-y-0 left-0 right-0 pointer-events-none flex items-center justify-between px-2 z-20">
      <UButton
        class="pointer-events-auto"
        color="neutral" variant="subtle" icon="i-lucide-chevron-left"
        @click.stop="emit('shift', 1)"
      />
      <UButton
        class="pointer-events-auto"
        color="neutral" variant="subtle" icon="i-lucide-chevron-right"
        @click.stop="emit('shift', -1)"
      />
    </div>

    <TimelineControlsPanel
      :scale="scale"
      :pending="pending"
      :hasNodes="!props.pending && props.positionedEvents.length > 0"
      @zoom-in="emit('zoomIn')"
      @zoom-out="emit('zoomOut')"
      @fit="emit('fit')"
    />

    <TimelineLoadingPanel :pending="pending" />

    <div
      class="relative min-h-[400px] touch-none select-none"
      :style="{
        width: `${contentWidth}px`,
        transform: `translateX(${translateX}px) scale(${scale})`,
        transformOrigin: 'left bottom',
        willChange: 'transform'
      }"
    >
      <TimelineEmptyState v-if="isEmpty" />

      <template v-else>
        <div class="absolute bottom-16 left-0 right-0 border-b border-default"/>

        <div
          v-for="marker in yearMarkers"
          :key="marker.year"
          class="absolute bottom-8 flex flex-col items-center"
          :style="{ left: `${marker.leftPx}px` }"
        >
          <div class="h-2 border-l border-default"/>
          <span class="mt-1 text-[10px] font-medium text-muted">
            {{ marker.year }}
          </span>
        </div>

        <div
          v-for="event in positionedEvents"
          :key="event.id || event.event_id"
          class="absolute bottom-16"
          :style="{
            left: `${event.leftPx}px`,
            '--timeline-level': event.stackIndex
          }"
        >
          <div class="mb-2 -translate-x-1/2 rounded-lg border border-default bg-default px-3 py-2 shadow-sm min-w-[140px]">
            <p class="text-[11px] font-bold text-highlighted truncate">
              {{ getEventTypeName(event.event_type_id) }}
            </p>
            <p class="text-[9px] text-muted">
              {{ event.date_iso?.slice(0, 4) || t('timeline.undated') }}
            </p>
            <p class="mt-1 text-[9px] text-muted line-clamp-1 border-t border-default/50 pt-1">
              {{ getPeopleNames(event.primary_person_ids) }}
            </p>
          </div>
          <div
            class="mx-auto w-px border-l border-dashed border-default"
            :style="{ height: `calc(1.5rem + ${event.stackIndex * 40}px)` }"
          />
        </div>
      </template>
    </div>
  </div>
</template>
