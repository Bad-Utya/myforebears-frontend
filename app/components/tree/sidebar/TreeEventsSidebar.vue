<script setup lang="ts">
import type TreeDTO from '~/services/familytree/dtos/inner/TreeDTO'
import type EventDTO from '~/services/events/dtos/inner/EventDTO'
import TreeEventTypesList from '~/components/tree/sidebar/events/TreeEventTypesList.vue'
import EventFormModal from '~/components/tree/modals/event/EventFormModal.vue'
import EventTypeFormModal from '~/components/tree/modals/event/EventTypeFormModal.vue'
import TreeEventsList from '~/components/tree/sidebar/events/TreeEventsList.vue'
import { useEventTypes } from '~/composables/trees/events/useEventsType'
import { useEvents } from '~/composables/trees/events/useEvents'
import type { EventParticipant } from '~/utils/ui/events/eventParticipants'

const props = defineProps<{
  treeId: string
  tree: TreeDTO | null
  participants: EventParticipant[]
  editable: boolean
}>()

const { eventTypes, fetchTypes, removeType } = useEventTypes()
const { events, fetchEvents, removeEvent } = useEvents(props.treeId)

const isEventModalOpen = ref(false)
const isTypeModalOpen = ref(false)
const selectedEvent = ref<EventDTO | null>(null)

onMounted(() => {
  fetchTypes()
  fetchEvents()
})

function openEdit(event: EventDTO) {
  selectedEvent.value = event
  isEventModalOpen.value = true
}

function openCreate() {
  selectedEvent.value = null
  isEventModalOpen.value = true
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <TreeEventTypesList
      :event-types="eventTypes"
      :editable="editable"
      @create="isTypeModalOpen = true"
      @delete="removeType"
    />

    <TreeEventsList
      :events="events"
      :event-types="eventTypes"
      :editable="editable"
      :participants="participants"
      @create="openCreate"
      @edit="openEdit"
      @delete="removeEvent"
    />

    <EventFormModal
      v-model:open="isEventModalOpen"
      :event="selectedEvent"
      :event-types="eventTypes"
      :participants="participants"
      :tree-id="treeId"
      @saved="fetchEvents"
    />

    <EventTypeFormModal
      v-model:open="isTypeModalOpen"
      @saved="fetchTypes"
    />
  </div>
</template>
