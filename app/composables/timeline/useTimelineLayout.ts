import { computed, type Ref } from 'vue'
import type EventDTO from '~/services/events/dtos/inner/EventDTO'

export function useTimelineLayout(
  events: Ref<EventDTO[]>,
  filters: { dateFrom: Ref<string>, dateTo: Ref<string>, personIds: Ref<string[]> },
  contentWidth: Ref<number>
) {
  const filteredEvents = computed(() => {
    const from = filters.dateFrom.value
    const to = filters.dateTo.value
    const selectedIds = new Set(filters.personIds.value)

    return events.value.filter((event) => {
      if (selectedIds.size > 0) {
        const eventPeople = [...(event.primary_person_ids ?? []), ...(event.additional_person_ids ?? [])]
        if (!eventPeople.some(id => selectedIds.has(id))) return false
      }
      if (from && event.date_iso && event.date_iso < from) return false
      if (to && event.date_iso && event.date_iso > to) return false

      return true
    })
  })

  const datedEvents = computed(() =>
    filteredEvents.value
      .filter(e => e.date_iso && !e.date_unknown)
      .sort((a, b) => (a.date_iso || '').localeCompare(b.date_iso || ''))
  )

  const undatedEvents = computed(() =>
    filteredEvents.value.filter(e => !e.date_iso || e.date_unknown)
  )

  const timelineYears = computed(() => {
    const years = datedEvents.value
      .map(e => parseInt(e.date_iso?.slice(0, 4) || ''))
      .filter(y => !isNaN(y))

    if (years.length === 0) return []

    const min = Math.min(...years) - 3
    const max = Math.max(...years) + 3
    return Array.from({ length: max - min + 1 }, (_, i) => min + i)
  })

  const positionedEvents = computed(() => {
    const startYear = timelineYears.value[0]

    if (timelineYears.value.length === 0 || !startYear) {
      return []
    }

    const totalYears = timelineYears.value.length - 1 || 1
    const slots = new Map<number, number>()

    return datedEvents.value.map((event) => {
      const date = new Date(event.date_iso!)
      const year = date.getFullYear()
      const yearProgress = (year - (startYear)) + (date.getMonth() / 12) + (date.getDate() / 365)

      const leftPx = (yearProgress / totalYears) * contentWidth.value

      const stackIndex = slots.get(year) ?? 0
      slots.set(year, stackIndex + 1)

      return {
        ...event,
        leftPx,
        stackIndex
      }
    })
  })

  const yearMarkers = computed(() => {
    const startYear = timelineYears.value[0]

    if (timelineYears.value.length === 0 || !startYear) {
      return []
    }

    const totalYears = timelineYears.value.length - 1 || 1

    return timelineYears.value.map(year => ({
      year,
      leftPx: ((year - startYear) / totalYears) * contentWidth.value
    }))
  })

  return {
    undatedEvents,
    positionedEvents,
    yearMarkers,
    timelineYears
  }
}
