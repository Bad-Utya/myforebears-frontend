<script setup lang="ts">
import type PersonDTO from "~/services/familytree/dtos/inner/PersonDTO";
import type TreeDTO from "~/services/familytree/dtos/inner/TreeDTO";
import type EventDTO from "~/services/events/dtos/inner/EventDTO";
import TreeEventTypesList from "~/components/tree/sidebar/events/TreeEventTypesList.vue";
import EventFormModal from "~/components/tree/modals/event/EventFormModal.vue";
import EventTypeFormModal from "~/components/tree/modals/event/EventTypeFormModal.vue";
import TreeEventsList from "~/components/tree/sidebar/events/TreeEventsList.vue";
import {useEventTypes} from "~/composables/trees/events/useEventsType";
import {useEvents} from "~/composables/trees/events/useEvents";
import TreeVisualizationsList from "~/components/tree/sidebar/visualizations/TreeVisualizationsList.vue";
import sendListVisualisationsRequest, {sendListVisualisationsConverted} from "~/services/visualisations/listVisualisations";
import TreeExportPanel from "~/components/tree/sidebar/visualizations/TreeExportPanel.vue";

const props = defineProps<{
  treeId: string
  tree: TreeDTO | null
  persons: PersonDTO[]
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
</script>

<template>
  <div class="flex flex-col gap-6">
    <TreeVisualizationsList
      :treeId="treeId"
      :persons="persons"
      :editable="editable"
    />

    <TreeExportPanel
      :treeId="treeId"
      :tree="tree"
      :persons="persons"
      :editable="editable"
    />

  </div>
</template>
