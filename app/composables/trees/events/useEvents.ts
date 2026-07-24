import type EventDTO from "~/services/events/dtos/inner/EventDTO";
import sendListEventsRequest from "~/services/events/listEvents";
import sendDeleteEventRequest from "~/services/events/deleteEvent";

export function useEvents(treeId: string) {
  const events = ref<EventDTO[]>([])
  const isPending = ref(false)

  const fetchEvents = async () => {
    if (!treeId) return
    isPending.value = true
    try {
      const res = await sendListEventsRequest(treeId)
      events.value = res.data?.events || []
    } finally { isPending.value = false }
  }

  const removeEvent = async (eventId: string) => {
    await sendDeleteEventRequest(treeId, eventId)
    await fetchEvents()
  }

  return { events, isPending, fetchEvents, removeEvent }
}
