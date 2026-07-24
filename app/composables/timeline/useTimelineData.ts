import { ref, computed, type Ref } from 'vue'
import type EventDTO from '~/services/events/dtos/inner/EventDTO'
import type EventTypeDTO from '~/services/eventTypes/dtos/inner/EventTypeDTO'
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import type TreeDTO from '~/services/familytree/dtos/inner/TreeDTO'
import type CustomTreeDTO from '~/services/customTrees/dtos/inner/CustomTreeDTO'

import sendGetTreeRequest from '~/services/familytree/getTree'
import sendGetTreeContentRequest from '~/services/familytree/getTreeContent'
import sendListEventsRequest from '~/services/events/listEvents'
import sendListEventTypesRequest from '~/services/eventTypes/listEventTypes'
import sendDeleteEventRequest from '~/services/events/deleteEvent'
import sendGetCustomTreeRequest from '~/services/customTrees/getCustomTree'
import sendGetCustomTreeContentRequest from '~/services/customTrees/getCustomTreeContent'
import type { EventParticipant } from '~/utils/ui/events/eventParticipants'
import { customEntityToEventParticipant, familyPersonToEventParticipant } from '~/utils/ui/events/eventParticipants'

export type TimelineTreeKind = 'family' | 'custom'

export function useTimelineData(treeId: Ref<string | undefined>, treeKind: Ref<TimelineTreeKind> = ref('family')) {
  const pending = ref(true)
  const tree = ref<TreeDTO | CustomTreeDTO | null>(null)
  const events = ref<EventDTO[]>([])
  const eventTypes = ref<EventTypeDTO[]>([])
  const persons = ref<PersonDTO[]>([])
  const participants = ref<EventParticipant[]>([])

  const personOptions = computed(() => {
    return participants.value.map(participant => ({
      label: participant.name,
      value: participant.id
    }))
  })

  const personNameById = computed(() => {
    const map = new Map<string, string>()
    personOptions.value.forEach(p => map.set(p.value, p.label))
    return map
  })

  const eventTypeById = computed(() => {
    const map = new Map<string, EventTypeDTO>()
    eventTypes.value.forEach((et) => {
      if (et.id) map.set(et.id, et)
    })
    return map
  })

  async function loadPageData() {
    if (!treeId.value) return
    pending.value = true
    try {
      const isCustom = treeKind.value === 'custom'
      const [eventsRes, typesRes] = await Promise.all([
        sendListEventsRequest(treeId.value),
        sendListEventTypesRequest()
      ])

      if (isCustom) {
        const [treeRes, contentRes] = await Promise.all([
          sendGetCustomTreeRequest(treeId.value),
          sendGetCustomTreeContentRequest(treeId.value)
        ])
        tree.value = treeRes.data?.tree ?? null
        persons.value = []
        participants.value = (contentRes.data?.entities ?? [])
          .map(customEntityToEventParticipant)
          .filter((participant): participant is EventParticipant => Boolean(participant))
      } else {
        const [treeRes, contentRes] = await Promise.all([
          sendGetTreeRequest(treeId.value),
          sendGetTreeContentRequest(treeId.value)
        ])
        tree.value = treeRes.data?.tree ?? null
        persons.value = contentRes.data?.persons ?? []
        participants.value = persons.value
          .map(familyPersonToEventParticipant)
          .filter((participant): participant is EventParticipant => Boolean(participant))
      }
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
    participants,
    personOptions,
    personNameById,
    eventTypeById,
    loadPageData,
    fetchEvents,
    removeEvent
  }
}
