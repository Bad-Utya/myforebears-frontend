import { ref, computed, type Ref } from 'vue'
import type EventDTO from '~/services/events/dtos/inner/EventDTO'
import type EventTypeDTO from '~/services/eventTypes/dtos/inner/EventTypeDTO'
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import type TreeDTO from '~/services/familytree/dtos/inner/TreeDTO'

import sendGetTreeRequest from '~/services/familytree/getTree'
import sendGetTreeContentRequest from '~/services/familytree/getTreeContent'
import sendListEventsRequest from '~/services/events/listEvents'
import sendListEventTypesRequest from '~/services/eventTypes/listEventTypes'
import sendDeleteEventTypeRequest from "~/services/eventTypes/deleteEventType";
import sendDeleteEventRequest from "~/services/events/deleteEvent";

export function useTimelineData(treeId: Ref<string | undefined>) {
  const pending = ref(true)
  const tree = ref<TreeDTO | null>(null)
  const events = ref<EventDTO[]>([])
  const eventTypes = ref<EventTypeDTO[]>([])
  const persons = ref<PersonDTO[]>([])

  const personOptions = computed(() => {
    return persons.value.map((p) => ({
      label: [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unnamed person',
      value: p.id || p.person_id || ''
    })).filter(p => p.value)
  })

  const personNameById = computed(() => {
    const map = new Map<string, string>()
    personOptions.value.forEach(p => map.set(p.value, p.label))
    return map
  })

  const eventTypeById = computed(() => {
    const map = new Map<string, EventTypeDTO>()
    eventTypes.value.forEach(et => {
      if (et.id) map.set(et.id, et)
    })
    return map
  })

  async function loadPageData() {
    if (!treeId.value) return
    pending.value = true
    try {
      const [treeRes, contentRes, eventsRes, typesRes] = await Promise.all([
        sendGetTreeRequest(treeId.value),
        sendGetTreeContentRequest(treeId.value),
        sendListEventsRequest(treeId.value),
        sendListEventTypesRequest()
      ])

      tree.value = treeRes.data?.tree ?? null
      persons.value = contentRes.data?.persons ?? []
      events.value = eventsRes.data?.events ?? []
      eventTypes.value = typesRes.data?.event_types ?? []
    } finally {
      pending.value = false
    }
  }

  const fetchEvents = async () => {
    if (!treeId.value) return

    pending.value = true
    try {
      const res = await sendListEventsRequest(treeId.value)
      events.value = res.data?.events || []
    } finally { pending.value = false }
  }

  const removeEvent = async (eventId: string) => {
    if (!treeId.value) return

    await sendDeleteEventRequest(treeId.value, eventId)
    await fetchEvents()
  }

  return {
    pending,
    tree,
    events,
    eventTypes,
    persons,
    personOptions,
    personNameById,
    eventTypeById,
    loadPageData,
    fetchEvents,
    removeEvent
  }
}
