<script setup lang="ts">
import type DataDTO from '~/composables/scripts/api/dtos/DataDTO'
import type EventTypeDTO from '~/composables/scripts/eventTypes/dtos/inner/EventTypeDTO'
import type { ListEventTypesResponse } from '~/composables/scripts/eventTypes/dtos/responses/ListEventTypesResponse'
import sendListEventTypesRequest from '~/composables/scripts/eventTypes/listEventTypes'
import sendCreateEventRequest from '~/composables/scripts/events/createEvent'
import sendDeleteEventRequest from '~/composables/scripts/events/deleteEvent'
import type EventDTO from '~/composables/scripts/events/dtos/inner/EventDTO'
import CreateEventRequest from '~/composables/scripts/events/dtos/requests/CreateEventRequest'
import type { ListEventsResponse } from '~/composables/scripts/events/dtos/responses/ListEventsResponse'
import sendListEventsRequest from '~/composables/scripts/events/listEvents'
import sendUpdateEventRequest from '~/composables/scripts/events/updateEvent'
import UpdateEventRequest from '~/composables/scripts/events/dtos/requests/UpdateEventRequest'
import type PersonDTO from '~/composables/scripts/familytree/dtos/inner/PersonDTO'
import type TreeDTO from '~/composables/scripts/familytree/dtos/inner/TreeDTO'
import sendGetTreeContentRequest from '~/composables/scripts/familytree/getTreeContent'
import sendGetTreeRequest from '~/composables/scripts/familytree/getTree'
import type { GetTreeContentResponse } from '~/composables/scripts/familytree/dtos/responses/GetTreeContentResponse'
import type { GetTreeResponse } from '~/composables/scripts/familytree/dtos/responses/GetTreeResponse'
import { getTreePersonId } from '~/composables/scripts/tree/resolveTreeRootPersonId'
import showApiErrorToast from '~/composables/scripts/ui/showApiErrorToast'

const MIN_SCALE = 0.65
const MAX_SCALE = 2.4
const SCALE_STEP = 0.14
const YEAR_OFFSET = 5
const SHIFT_STEP = 260

type PersonOption = {
  label: string
  value: string
}

type PositionedTimelineEvent = EventDTO & {
  leftPx: number
  stackIndex: number
}

const route = useRoute()
const treeId = computed(() => {
  const routeId = route.params.id
  return Array.isArray(routeId) ? routeId[0] : routeId
})

const pending = ref(true)
const tree = ref<TreeDTO | null>(null)
const persons = ref<PersonDTO[]>([])
const events = ref<EventDTO[]>([])
const eventTypes = ref<EventTypeDTO[]>([])
const timelineDateFrom = ref('')
const timelineDateTo = ref('')
const timelinePersonIds = ref<string[]>([])
const eventModalOpen = ref(false)
const editingEventId = ref('')
const selectedEventTypeId = ref('')
const eventDateDay = ref('')
const eventDateMonth = ref('')
const eventDateYear = ref('')
const eventDatePrecision = ref('DAY')
const eventDateBound = ref('EXACT')
const eventDateUnknown = ref(false)
const primaryPersonIds = ref<string[]>([])
const additionalPersonIds = ref<string[]>([])
const isEventSaving = ref(false)

const viewportRef = ref<HTMLElement | null>(null)
const contentWidth = ref(1400)
const translateX = ref(0)
const scale = ref(1)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragOriginX = ref(0)

const personOptions = computed<PersonOption[]>(() => {
  return persons.value
    .map((person) => {
      const personId = getTreePersonId(person) ?? ''
      const label = [person.first_name, person.last_name].filter(Boolean).join(' ') || 'Unnamed person'

      return { label, value: personId }
    })
    .filter(person => Boolean(person.value))
})

const personNameById = computed(() => new Map(personOptions.value.map(person => [person.value, person.label])))
const eventTypeById = computed(() => new Map(eventTypes.value.map(eventType => [eventType.id ?? '', eventType])))
const additionalPersonOptions = computed(() => {
  return personOptions.value.filter(person => !primaryPersonIds.value.includes(person.value))
})
const selectedPrimaryPeople = computed(() => {
  return primaryPersonIds.value.map((id) => ({ id, label: personNameById.value.get(id) ?? id }))
})
const selectedAdditionalPeople = computed(() => {
  return additionalPersonIds.value.map((id) => ({ id, label: personNameById.value.get(id) ?? id }))
})
const eventModalTitle = computed(() => editingEventId.value ? 'Edit event' : 'Create event')
const eventModalDescription = computed(() => editingEventId.value
  ? 'Update event type, date and participants.'
  : 'Choose a type, date and participants.'
)
const precisionOptions = [
  { value: 'DAY', label: 'Day' },
  { value: 'MONTH', label: 'Month' },
  { value: 'YEAR', label: 'Year' }
]
const boundOptions = [
  { value: 'EXACT', label: 'Exact' },
  { value: 'NOT_BEFORE', label: 'Not before' },
  { value: 'NOT_AFTER', label: 'Not after' }
]
const selectedEventType = computed(() => eventTypeById.value.get(selectedEventTypeId.value))
const primaryCountError = computed(() => {
  const eventType = selectedEventType.value

  if (!eventType) {
    return undefined
  }

  const requiredCount = eventType.primary_persons_count ?? 0

  if ((eventType.primary_persons_mode ?? '').includes('EXACT') && primaryPersonIds.value.length !== requiredCount) {
    return `Choose exactly ${requiredCount} primary people.`
  }

  if ((eventType.primary_persons_mode ?? '').includes('AT_LEAST') && primaryPersonIds.value.length < requiredCount) {
    return `Choose at least ${requiredCount} primary people.`
  }

  return undefined
})
const canSubmitEvent = computed(() => {
  return Boolean(selectedEventTypeId.value)
    && !primaryCountError.value
    && (eventDateUnknown.value || Boolean(buildEventDateIso()))
})
const scalePercentLabel = computed(() => `${Math.round(scale.value * 100)}%`)

const filteredTimelineEvents = computed(() => {
  const from = timelineDateFrom.value || undefined
  const to = timelineDateTo.value || undefined
  const selectedPersonIds = new Set(timelinePersonIds.value)

  return [...events.value]
    .filter((event) => {
      if (selectedPersonIds.size > 0) {
        const eventPersonIds = [
          ...(event.primary_person_ids ?? []),
          ...(event.additional_person_ids ?? [])
        ]

        if (!eventPersonIds.some(id => selectedPersonIds.has(id))) {
          return false
        }
      }

      if (!event.date_iso) {
        return !from && !to
      }

      if (from && event.date_iso < from) {
        return false
      }

      if (to && event.date_iso > to) {
        return false
      }

      return true
    })
    .sort((left, right) => {
      if (!left.date_iso && !right.date_iso) {
        return 0
      }

      if (!left.date_iso) {
        return 1
      }

      if (!right.date_iso) {
        return -1
      }

      return left.date_iso.localeCompare(right.date_iso)
    })
})

const datedTimelineEvents = computed(() => {
  return filteredTimelineEvents.value.filter(event => Boolean(event.date_iso) && !event.date_unknown)
})

const undatedTimelineEvents = computed(() => {
  return filteredTimelineEvents.value.filter(event => !event.date_iso || event.date_unknown)
})

const timelineYears = computed(() => {
  const years = datedTimelineEvents.value
    .map(event => Number(event.date_iso?.slice(0, 4)))
    .filter((year) => Number.isFinite(year))

  if (!years.length) {
    return [] as number[]
  }

  const minYear = Math.min(...years) - YEAR_OFFSET
  const maxYear = Math.max(...years) + YEAR_OFFSET
  const result: number[] = []

  for (let year = minYear; year <= maxYear; year += 1) {
    result.push(year)
  }

  return result
})

const timelineStartYear = computed(() => timelineYears.value[0] ?? new Date().getFullYear() - YEAR_OFFSET)
const timelineEndYear = computed(() => timelineYears.value[timelineYears.value.length - 1] ?? new Date().getFullYear() + YEAR_OFFSET)
const timelineSpanYears = computed(() => Math.max(1, timelineEndYear.value - timelineStartYear.value))
const yearMarkers = computed(() => {
  const years = timelineYears.value

  if (!years.length) {
    return [] as Array<{ year: number, leftPx: number }>
  }

  return years.map((year) => ({
    year,
    leftPx: ((year - timelineStartYear.value) / timelineSpanYears.value) * contentWidth.value
  }))
})

const positionedTimelineEvents = computed<PositionedTimelineEvent[]>(() => {
  const slots = new Map<number, number>()

  return datedTimelineEvents.value.map((event) => {
    const year = Number(event.date_iso?.slice(0, 4))
    const month = Number(event.date_iso?.slice(5, 7) || '1')
    const day = Number(event.date_iso?.slice(8, 10) || '1')
    const yearOffset = year - timelineStartYear.value + (Math.max(month, 1) - 1) / 12 + (Math.max(day, 1) - 1) / 365
    const leftPx = (yearOffset / timelineSpanYears.value) * contentWidth.value
    const stackIndex = slots.get(year) ?? 0

    slots.set(year, stackIndex + 1)

    return {
      ...event,
      leftPx,
      stackIndex
    }
  })
})

const timelineSummary = computed(() => {
  return `${filteredTimelineEvents.value.length} events • ${timelineYears.value.length ? `${timelineStartYear.value}–${timelineEndYear.value}` : 'No dated events'}`
})

function normalizeEventDatePrecision(value?: string) {
  if (value === 'MONTH' || value === 'EVENT_DATE_PRECISION_MONTH') {
    return 'MONTH'
  }

  if (value === 'YEAR' || value === 'EVENT_DATE_PRECISION_YEAR') {
    return 'YEAR'
  }

  return 'DAY'
}

function normalizeEventDateBound(value?: string) {
  if (value === 'NOT_BEFORE' || value === 'EVENT_DATE_BOUND_NOT_BEFORE') {
    return 'NOT_BEFORE'
  }

  if (value === 'NOT_AFTER' || value === 'EVENT_DATE_BOUND_NOT_AFTER') {
    return 'NOT_AFTER'
  }

  return 'EXACT'
}

function isApproximateEvent(event: EventDTO) {
  return Boolean(
    event.date_unknown
    || normalizeEventDatePrecision(event.date_precision) !== 'DAY'
    || normalizeEventDateBound(event.date_bound) !== 'EXACT'
  )
}

function formatTimelineDate(event: EventDTO) {
  if (event.date_unknown) {
    return 'Date unknown'
  }

  const parts = [event.date_iso || 'Undated']
  const precision = normalizeEventDatePrecision(event.date_precision)
  const bound = normalizeEventDateBound(event.date_bound)

  if (precision === 'YEAR') {
    parts.push('year precision')
  } else if (precision === 'MONTH') {
    parts.push('month precision')
  }

  if (bound === 'NOT_BEFORE') {
    parts.push('not before')
  } else if (bound === 'NOT_AFTER') {
    parts.push('not after')
  }

  return parts.join(' • ')
}

function formatEventTypeLabel(eventTypeId?: string) {
  return eventTypeById.value.get(eventTypeId ?? '')?.name ?? 'Unknown type'
}

function formatPeople(ids?: string[]) {
  if (!ids?.length) {
    return 'None'
  }

  return ids.map(id => personNameById.value.get(id) ?? id).join(', ')
}

function populateEventDateInput(dateIso?: string, precision?: string) {
  if (!dateIso) {
    eventDateDay.value = ''
    eventDateMonth.value = ''
    eventDateYear.value = ''
    return
  }

  const normalizedPrecision = normalizeEventDatePrecision(precision)
  const [year = '', month = '', day = ''] = dateIso.split('-')

  eventDateYear.value = year

  if (normalizedPrecision === 'MONTH') {
    eventDateMonth.value = month ? String(Number(month)).padStart(2, '0') : ''
    eventDateDay.value = ''
    return
  }

  if (normalizedPrecision === 'YEAR') {
    eventDateMonth.value = ''
    eventDateDay.value = ''
    return
  }

  eventDateMonth.value = month
  eventDateDay.value = `${year}-${month}-${day}`.slice(0, 10)
}

function buildEventDateIso() {
  if (eventDateUnknown.value) {
    return ''
  }

  if (eventDatePrecision.value === 'MONTH') {
    const year = eventDateYear.value.trim()
    const monthRaw = eventDateMonth.value.trim()
    const monthNumber = Number(monthRaw)
    const month = Number.isInteger(monthNumber) ? String(monthNumber).padStart(2, '0') : ''

    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || monthNumber < 1 || monthNumber > 12) {
      return ''
    }

    return `${year}-${month}-01`
  }

  if (eventDatePrecision.value === 'YEAR') {
    const year = eventDateYear.value.trim()
    return /^\d{4}$/.test(year) ? `${year}-01-01` : ''
  }

  const rawValue = eventDateDay.value.trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(rawValue) ? rawValue : ''
}

function handleEventPrecisionChange(nextPrecision: string) {
  const currentIso = buildEventDateIso()
  eventDatePrecision.value = nextPrecision

  if (currentIso) {
    populateEventDateInput(currentIso, nextPrecision)
  }
}

function resetEventForm() {
  editingEventId.value = ''
  selectedEventTypeId.value = eventTypes.value[0]?.id ?? ''
  eventDateDay.value = ''
  eventDateMonth.value = ''
  eventDateYear.value = ''
  eventDatePrecision.value = 'DAY'
  eventDateBound.value = 'EXACT'
  eventDateUnknown.value = false
  primaryPersonIds.value = []
  additionalPersonIds.value = []
}

function openEditEventModal(event: EventDTO) {
  editingEventId.value = String(event.id || event.event_id || '')
  selectedEventTypeId.value = event.event_type_id ?? eventTypes.value[0]?.id ?? ''
  eventDateUnknown.value = Boolean(event.date_unknown)
  eventDatePrecision.value = normalizeEventDatePrecision(event.date_precision)
  eventDateBound.value = normalizeEventDateBound(event.date_bound)
  primaryPersonIds.value = [...(event.primary_person_ids ?? [])]
  additionalPersonIds.value = [...(event.additional_person_ids ?? [])]
  populateEventDateInput(event.date_iso, event.date_precision)
  eventModalOpen.value = true
}

function fitTimeline() {
  const viewport = viewportRef.value

  if (!viewport) {
    return
  }

  const baseWidth = Math.max(viewport.clientWidth - 48, timelineYears.value.length * 86, 960)
  contentWidth.value = baseWidth
  scale.value = 1
  translateX.value = 0
}

function clampTranslate(nextTranslateX: number, nextScale = scale.value) {
  const viewport = viewportRef.value

  if (!viewport) {
    return nextTranslateX
  }

  const scaledWidth = contentWidth.value * nextScale
  const minTranslateX = Math.min(0, viewport.clientWidth - scaledWidth)

  return Math.max(minTranslateX, Math.min(0, nextTranslateX))
}

function setScale(nextScale: number, anchorRatio = 0.5) {
  const viewport = viewportRef.value

  if (!viewport) {
    return
  }

  const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale))
  const anchorX = viewport.clientWidth * anchorRatio
  const sceneX = (anchorX - translateX.value) / scale.value
  const nextTranslateX = anchorX - sceneX * clampedScale

  scale.value = clampedScale
  translateX.value = clampTranslate(nextTranslateX, clampedScale)
}

function zoomIn() {
  setScale(scale.value + SCALE_STEP)
}

function zoomOut() {
  setScale(scale.value - SCALE_STEP)
}

function shiftTimeline(direction: -1 | 1) {
  translateX.value = clampTranslate(translateX.value + direction * SHIFT_STEP)
}

function inlineStyles(source: Element, target: Element) {
  const sourceElement = source as HTMLElement
  const targetElement = target as HTMLElement
  const computedStyle = window.getComputedStyle(sourceElement)

  for (const propertyName of computedStyle) {
    targetElement.style.setProperty(
      propertyName,
      computedStyle.getPropertyValue(propertyName),
      computedStyle.getPropertyPriority(propertyName)
    )
  }

  const sourceChildren = Array.from(source.children)
  const targetChildren = Array.from(target.children)

  sourceChildren.forEach((child, index) => {
    const targetChild = targetChildren[index]

    if (targetChild) {
      inlineStyles(child, targetChild)
    }
  })
}

async function saveTimeline() {
  const node = viewportRef.value

  if (!node) {
    return
  }

  const rect = node.getBoundingClientRect()
  const clone = node.cloneNode(true) as HTMLElement

  clone.querySelectorAll('[data-export-ignore="true"]').forEach((element) => element.remove())
  inlineStyles(node, clone)
  clone.style.margin = '0'
  clone.style.width = `${rect.width}px`
  clone.style.height = `${rect.height}px`

  const wrapper = document.createElement('div')
  wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
  wrapper.appendChild(clone)

  const serialized = new XMLSerializer().serializeToString(wrapper)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}" viewBox="0 0 ${rect.width} ${rect.height}">
      <foreignObject width="100%" height="100%">
        ${serialized}
      </foreignObject>
    </svg>
  `
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = (error) => reject(error)
      img.src = url
    })

    const canvas = document.createElement('canvas')
    const pixelRatio = window.devicePixelRatio || 1

    canvas.width = Math.max(1, Math.round(rect.width * pixelRatio))
    canvas.height = Math.max(1, Math.round(rect.height * pixelRatio))

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    context.scale(pixelRatio, pixelRatio)
    context.drawImage(image, 0, 0, rect.width, rect.height)

    const pngUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')

    link.href = pngUrl
    link.download = `timeline-${treeId.value || 'tree'}.png`
    link.click()
  } finally {
    URL.revokeObjectURL(url)
  }
}

function startDragging(event: PointerEvent) {
  isDragging.value = true
  dragStartX.value = event.clientX
  dragOriginX.value = translateX.value
}

function handlePointerMove(event: PointerEvent) {
  if (!isDragging.value) {
    return
  }

  translateX.value = clampTranslate(dragOriginX.value + event.clientX - dragStartX.value)
}

function stopDragging() {
  isDragging.value = false
}

function handleWheel(event: WheelEvent) {
  event.preventDefault()

  const viewport = viewportRef.value
  const bounds = viewport?.getBoundingClientRect()
  const anchorRatio = bounds ? (event.clientX - bounds.left) / bounds.width : 0.5
  const direction = event.deltaY > 0 ? -1 : 1

  setScale(scale.value + direction * SCALE_STEP, Math.max(0, Math.min(1, anchorRatio)))
}

async function submitEvent() {
  if (isEventSaving.value || !treeId.value || !canSubmitEvent.value) {
    return
  }

  isEventSaving.value = true

  try {
    const isEditing = Boolean(editingEventId.value)
    const payload = [
      treeId.value,
      selectedEventTypeId.value,
      buildEventDateIso(),
      eventDatePrecision.value,
      eventDateUnknown.value,
      eventDateBound.value,
      primaryPersonIds.value,
      additionalPersonIds.value
    ] as const

    if (isEditing) {
      await sendUpdateEventRequest(
        treeId.value,
        editingEventId.value,
        new UpdateEventRequest(...payload)
      )
    } else {
      await sendCreateEventRequest(
        treeId.value,
        new CreateEventRequest(...payload)
      )
    }

    eventModalOpen.value = false
    resetEventForm()
    await loadPageData()
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    isEventSaving.value = false
  }
}

async function deleteEvent(event: EventDTO) {
  const eventId = String(event.id || event.event_id || '')

  if (!treeId.value || !eventId) {
    return
  }

  try {
    await sendDeleteEventRequest(treeId.value, eventId)
    await loadPageData()
  } catch (error) {
    showApiErrorToast(error)
  }
}

async function loadPageData() {
  if (!treeId.value) {
    return
  }

  const [treeResponse, treeContentResponse, eventsResponse, eventTypesResponse] = await Promise.all([
    sendGetTreeRequest(treeId.value) as Promise<DataDTO<GetTreeResponse>>,
    sendGetTreeContentRequest(treeId.value) as Promise<DataDTO<GetTreeContentResponse>>,
    sendListEventsRequest(treeId.value) as Promise<DataDTO<ListEventsResponse>>,
    sendListEventTypesRequest() as Promise<DataDTO<ListEventTypesResponse>>
  ])

  tree.value = treeResponse.data?.tree ?? null
  persons.value = Array.isArray(treeContentResponse.data?.persons) ? treeContentResponse.data.persons : []
  events.value = Array.isArray(eventsResponse.data?.events) ? eventsResponse.data.events : []
  eventTypes.value = Array.isArray(eventTypesResponse.data?.event_types) ? eventTypesResponse.data.event_types : []

  await nextTick()
  fitTimeline()
}

watch(
  () => [timelineDateFrom.value, timelineDateTo.value, timelinePersonIds.value.join(','), datedTimelineEvents.value.length],
  async () => {
    await nextTick()
    fitTimeline()
  }
)

watch(
  () => primaryPersonIds.value,
  (nextPrimaryIds) => {
    additionalPersonIds.value = additionalPersonIds.value.filter(id => !nextPrimaryIds.includes(id))
  }
)

watch(
  () => eventModalOpen.value,
  (isOpen) => {
    if (!isOpen) {
      resetEventForm()
    }
  }
)

onMounted(async () => {
  try {
    await loadPageData()
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    pending.value = false
  }

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', stopDragging)
  window.addEventListener('pointercancel', stopDragging)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', stopDragging)
  window.removeEventListener('pointercancel', stopDragging)
})
</script>

<template>
  <UMain class="timeline-page min-h-screen p-4 sm:p-6">
    <div class="mx-auto flex max-w-[1500px] flex-col gap-4">
      <section class="rounded-[2rem] border border-default bg-default/90 p-4 shadow-sm sm:p-6">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-lg font-semibold text-highlighted">
              {{ tree?.name ?? tree?.title ?? 'Timeline' }}
            </p>
            <p class="mt-1 text-sm text-muted">
              {{ timelineSummary }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <UButton color="neutral" variant="ghost" icon="i-lucide-minus" :disabled="pending" @click="zoomOut" />
            <UButton color="neutral" variant="ghost" icon="i-lucide-scan-search" :disabled="pending" @click="fitTimeline" />
            <UButton color="neutral" variant="ghost" icon="i-lucide-plus" :disabled="pending" @click="zoomIn" />
            <span class="min-w-14 text-center text-xs font-medium text-muted">{{ scalePercentLabel }}</span>
          </div>
        </div>

        <div
          ref="viewportRef"
          class="timeline-canvas relative overflow-hidden rounded-[1.5rem] border border-default bg-white/50"
          :class="{ 'cursor-grabbing': isDragging, 'cursor-grab': !isDragging }"
          @pointerdown="startDragging"
          @wheel.prevent="handleWheel"
        >
          <UButton
            class="timeline-canvas__nav timeline-canvas__nav--left"
            data-export-ignore="true"
            color="neutral"
            variant="soft"
            icon="i-lucide-chevron-left"
            :disabled="pending"
            @click.stop="shiftTimeline(1)"
          />
          <UButton
            class="timeline-canvas__nav timeline-canvas__nav--right"
            data-export-ignore="true"
            color="neutral"
            variant="soft"
            icon="i-lucide-chevron-right"
            :disabled="pending"
            @click.stop="shiftTimeline(-1)"
          />

          <div v-if="pending" class="absolute inset-0 z-10 flex items-center justify-center">
            <div class="flex items-center gap-3 rounded-full border border-default bg-default/90 px-4 py-2 text-sm text-highlighted shadow-lg">
              <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
              Loading timeline
            </div>
          </div>

          <div
            class="timeline-scene relative"
            :style="{
              width: `${contentWidth}px`,
              transform: `translate3d(${translateX}px, 0, 0) scale(${scale})`
            }"
          >
            <div
              v-for="event in positionedTimelineEvents"
              :key="`page-timeline-${event.id || event.event_id}`"
              class="timeline-event absolute"
              :class="{ 'timeline-event--approximate': isApproximateEvent(event) }"
              :style="{
                left: `${event.leftPx}px`,
                '--timeline-level': event.stackIndex
              }"
            >
              <div class="timeline-event__card rounded-lg border border-default bg-default/96 px-3 py-2 shadow-sm">
                <p class="text-[11px] font-semibold text-highlighted">
                  {{ formatEventTypeLabel(event.event_type_id) }}
                </p>
                <p class="mt-1 text-[10px] text-muted">
                  {{ formatTimelineDate(event) }}
                </p>
                <p class="mt-1 text-[10px] text-muted">
                  Primary: {{ formatPeople(event.primary_person_ids) }}
                </p>
              </div>
              <div class="timeline-event__stem" />
            </div>

            <div class="timeline-axis absolute left-0 right-0" />

            <div
              v-for="marker in yearMarkers"
              :key="`year-${marker.year}`"
              class="timeline-year-marker absolute"
              :style="{ left: `${marker.leftPx}px` }"
            >
              <div class="timeline-year-marker__tick" />
              <span class="timeline-year-marker__label">{{ marker.year }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-[2rem] border border-default bg-default/90 p-4 shadow-sm sm:p-6">
        <div class="flex flex-col gap-4">
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <UInput
              v-model="timelineDateFrom"
              type="date"
              color="neutral"
              variant="subtle"
              placeholder="From"
            />
            <UInput
              v-model="timelineDateTo"
              type="date"
              color="neutral"
              variant="subtle"
              placeholder="To"
            />
            <USelectMenu
              v-model="timelinePersonIds"
              multiple
              :items="personOptions"
              value-key="value"
              label-key="label"
              placeholder="Choose people"
              color="neutral"
              variant="subtle"
              class="lg:col-span-2"
            />
            <UButton color="neutral" variant="soft" icon="i-lucide-save" :disabled="pending" @click="saveTimeline">
              Save PNG
            </UButton>
          </div>

          <div v-if="timelinePersonIds.length" class="flex flex-wrap items-center gap-2">
            <UBadge
              v-for="personId in timelinePersonIds"
              :key="`timeline-person-${personId}`"
              color="primary"
              variant="subtle"
              class="rounded-full border border-primary/40 px-3 py-1"
            >
              {{ personNameById.get(personId) ?? personId }}
            </UBadge>
          </div>

          <div v-if="undatedTimelineEvents.length" class="rounded-xl border border-default bg-default/90 p-4">
            <p class="text-sm font-semibold text-highlighted">
              Undated or unknown-date events
            </p>
            <div class="mt-3 flex flex-col gap-2">
              <article
                v-for="event in undatedTimelineEvents"
                :key="`undated-${event.id || event.event_id}`"
                class="group rounded-lg border border-default px-3 py-3"
                :class="{ 'timeline-event__card--approximate': isApproximateEvent(event) }"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-highlighted">
                      {{ formatEventTypeLabel(event.event_type_id) }}
                    </p>
                    <p class="mt-1 text-xs text-muted">
                      {{ formatTimelineDate(event) }}
                    </p>
                    <p class="mt-2 text-xs text-muted">
                      Primary: {{ formatPeople(event.primary_person_ids) }}
                    </p>
                    <p class="mt-1 text-xs text-muted">
                      Additional: {{ formatPeople(event.additional_person_ids) }}
                    </p>
                  </div>
                  <div class="flex items-center gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                    <UButton color="neutral" variant="ghost" icon="i-lucide-pencil" @click="openEditEventModal(event)" />
                    <UButton color="error" variant="ghost" icon="i-lucide-trash-2" @click="deleteEvent(event)" />
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" @click="navigateTo(`/trees/${treeId}/main`)">
              Back
            </UButton>

            <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
              <UBadge color="neutral" variant="subtle">
                {{ filteredTimelineEvents.length }} events
              </UBadge>
              <span>Approximate dates use striped cards.</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <UModal
      v-model:open="eventModalOpen"
      :title="eventModalTitle"
      :description="eventModalDescription"
    >
      <template #body>
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm text-muted">Event type</label>
            <USelect
              v-model="selectedEventTypeId"
              :items="eventTypes.map(eventType => ({ label: eventType.name || 'Unnamed type', value: eventType.id || '' }))"
              value-key="value"
              placeholder="Choose event type"
              color="neutral"
              variant="subtle"
            />
          </div>

          <UCheckbox v-model="eventDateUnknown" label="Unknown date" />

          <div v-if="!eventDateUnknown" class="grid gap-3">
            <UInput
              v-if="eventDatePrecision === 'DAY'"
              v-model="eventDateDay"
              type="date"
              color="neutral"
              variant="subtle"
            />

            <div v-else-if="eventDatePrecision === 'MONTH'" class="grid gap-3 sm:grid-cols-2">
              <UInput v-model="eventDateMonth" type="number" min="1" max="12" color="neutral" variant="subtle" placeholder="MM" />
              <UInput v-model="eventDateYear" type="number" min="1" max="9999" color="neutral" variant="subtle" placeholder="YYYY" />
            </div>

            <UInput
              v-else
              v-model="eventDateYear"
              type="number"
              min="1"
              max="9999"
              color="neutral"
              variant="subtle"
              placeholder="YYYY"
            />

            <USelect
              v-model="eventDatePrecision"
              :items="precisionOptions"
              value-key="value"
              placeholder="Choose date precision"
              color="neutral"
              variant="subtle"
              @update:model-value="handleEventPrecisionChange"
            />

            <USelect
              v-model="eventDateBound"
              :items="boundOptions"
              value-key="value"
              placeholder="Choose date bound"
              color="neutral"
              variant="subtle"
            />
          </div>

          <div class="space-y-2">
            <p class="text-sm text-muted">Primary people</p>
            <USelectMenu
              v-model="primaryPersonIds"
              multiple
              :items="personOptions"
              value-key="value"
              label-key="label"
              placeholder="Choose primary people"
              color="neutral"
              variant="subtle"
            />
            <p v-if="primaryCountError" class="text-xs text-error">
              {{ primaryCountError }}
            </p>
          </div>

          <div class="space-y-2">
            <p class="text-sm text-muted">Additional people</p>
            <USelectMenu
              v-model="additionalPersonIds"
              multiple
              :items="additionalPersonOptions"
              value-key="value"
              label-key="label"
              placeholder="Choose additional people"
              color="neutral"
              variant="subtle"
            />
          </div>

          <div v-if="selectedPrimaryPeople.length || selectedAdditionalPeople.length" class="rounded-xl border border-default p-3">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-medium uppercase tracking-[0.16em] text-muted">Participants</span>
              <UBadge
                v-for="person in selectedPrimaryPeople"
                :key="`primary-${person.id}`"
                color="primary"
                variant="subtle"
                class="rounded-full border border-primary/40 px-3 py-1"
              >
                Primary: {{ person.label }}
              </UBadge>
              <UBadge
                v-for="person in selectedAdditionalPeople"
                :key="`additional-${person.id}`"
                color="neutral"
                variant="soft"
                class="rounded-full px-3 py-1"
              >
                Additional: {{ person.label }}
              </UBadge>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="eventModalOpen = false">
              Cancel
            </UButton>
            <UButton color="neutral" variant="soft" :loading="isEventSaving" :disabled="!canSubmitEvent" @click="submitEvent">
              {{ editingEventId ? 'Save event' : 'Create event' }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UMain>
</template>

<style scoped>
.timeline-page {
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--ui-primary) 10%, transparent 90%), transparent 26%),
    linear-gradient(180deg, color-mix(in srgb, var(--ui-bg) 96%, white 4%), var(--ui-bg));
}

.timeline-canvas {
  min-height: 32rem;
}

.timeline-canvas__nav {
  position: absolute;
  top: 50%;
  z-index: 20;
  transform: translateY(-50%);
  backdrop-filter: blur(8px);
  background: color-mix(in srgb, var(--ui-bg) 68%, transparent 32%);
}

.timeline-canvas__nav--left {
  left: 1rem;
}

.timeline-canvas__nav--right {
  right: 1rem;
}

.timeline-scene {
  min-height: 28rem;
  transform-origin: left bottom;
  will-change: transform;
}

.timeline-axis {
  bottom: 4rem;
  border-top: 1px dashed color-mix(in srgb, var(--ui-border) 76%, transparent 24%);
}

.timeline-year-marker {
  bottom: 0.8rem;
  transform: translateX(-50%);
}

.timeline-year-marker__tick {
  margin: 0 auto;
  height: 1rem;
  width: 1px;
  background: color-mix(in srgb, var(--ui-border) 88%, transparent 12%);
}

.timeline-year-marker__label {
  display: block;
  margin-top: 0.45rem;
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}

.timeline-event {
  bottom: 4rem;
  width: 8rem;
  transform: translateX(-50%);
}

.timeline-event__card {
  background: color-mix(in srgb, var(--ui-bg) 98%, white 2%);
  margin-bottom: 0.4rem;
}

.timeline-event__stem {
  margin: 0.35rem auto 0;
  height: calc(2.05rem + var(--timeline-level, 0) * 5rem);
  width: 1px;
  border-left: 1px dashed color-mix(in srgb, var(--ui-border) 80%, transparent 20%);
}

.timeline-event--approximate .timeline-event__card,
.timeline-event__card--approximate {
  background:
    repeating-linear-gradient(
      -45deg,
      color-mix(in srgb, var(--ui-warning) 10%, transparent 90%) 0,
      color-mix(in srgb, var(--ui-warning) 10%, transparent 90%) 8px,
      transparent 8px,
      transparent 16px
    ),
    color-mix(in srgb, var(--ui-bg) 96%, var(--ui-warning) 4%) !important;
}

</style>
