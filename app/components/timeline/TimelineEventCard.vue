<script setup lang="ts">
import type EventDTO from '~/services/events/dtos/inner/EventDTO'
import {
  formatTimelineDate,
  isApproximateEvent
} from '~/utils/timeline/eventFormatters'

interface Props {
  event: EventDTO
  stackIndex: number
  leftPx: number
  eventTypeName: string
  primaryPeopleLabels: string
}

const props = defineProps<Props>()
</script>

<template>
  <div
    class="timeline-event absolute"
    :class="{ 'timeline-event--approximate': isApproximateEvent(event) }"
    :style="{
      left: `${leftPx}px`,
      '--timeline-level': stackIndex
    }"
  >
    <div class="timeline-event__card rounded-lg border border-default bg-timeline-event-card-bg px-4 py-2 shadow-sm">
      <p class="text-xs font-semibold text-highlighted">
        {{ eventTypeName }}
      </p>
      <p class="mt-1 text-[11px] text-muted">
        {{ formatTimelineDate(event) }}
      </p>
      <p class="mt-1 text-[11px] text-muted">
        Primary: {{ primaryPeopleLabels }}
      </p>
    </div>
    <div class="timeline-event__stem" />
  </div>
</template>

<style scoped>
.timeline-event {
  bottom: 4rem;
  width: 9.5rem;
  transform: translateX(-50%);
}
.timeline-event__card {
  margin-bottom: 0.4rem;
}
.timeline-event__stem {
  margin: 0.35rem auto 0;
  height: calc(2.4rem + var(--timeline-level, 0) * 6.6rem);
  width: 1px;
  border-left: 1px dashed var(--color-timeline-stem);
}
</style>
