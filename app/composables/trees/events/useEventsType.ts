import sendListEventTypesRequest from "~/services/eventTypes/listEventTypes";
import sendDeleteEventTypeRequest from "~/services/eventTypes/deleteEventType";
import type EventTypeDTO from "~/services/eventTypes/dtos/inner/EventTypeDTO";

export function useEventTypes() {
  const eventTypes = ref<EventTypeDTO[]>([])
  const isPending = ref(false)

  const fetchTypes = async () => {
    isPending.value = true
    try {
      const res = await sendListEventTypesRequest()
      eventTypes.value = res.data?.event_types || []
    } finally { isPending.value = false }
  }

  const removeType = async (id: string) => {
    await sendDeleteEventTypeRequest(id)
    await fetchTypes()
  }

  return { eventTypes, isPending, fetchTypes, removeType }
}
