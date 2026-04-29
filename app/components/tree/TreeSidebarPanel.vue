<script setup lang="ts">
import AvatarCropper from '~/components/common/AvatarCropper.vue'
import { treeFieldUi, treeSelectMenuUi, treeSelectUi, treeTextareaUi } from '~/composables/ui/treeTheme'
import sendCreateEventTypeRequest from '~/composables/scripts/eventTypes/createEventType'
import sendDeleteEventTypeRequest from '~/composables/scripts/eventTypes/deleteEventType'
import type EventTypeDTO from '~/composables/scripts/eventTypes/dtos/inner/EventTypeDTO'
import type { ListEventTypesResponse } from '~/composables/scripts/eventTypes/dtos/responses/ListEventTypesResponse'
import sendListEventTypesRequest from '~/composables/scripts/eventTypes/listEventTypes'
import type DataDTO from '~/composables/scripts/api/dtos/DataDTO'
import sendCreateEventRequest from '~/composables/scripts/events/createEvent'
import sendDeleteEventRequest from '~/composables/scripts/events/deleteEvent'
import type EventDTO from '~/composables/scripts/events/dtos/inner/EventDTO'
import CreateEventRequest from '~/composables/scripts/events/dtos/requests/CreateEventRequest'
import type { ListEventsResponse } from '~/composables/scripts/events/dtos/responses/ListEventsResponse'
import sendListEventsRequest from '~/composables/scripts/events/listEvents'
import sendUpdateEventRequest from '~/composables/scripts/events/updateEvent'
import UpdateEventRequest from '~/composables/scripts/events/dtos/requests/UpdateEventRequest'
import sendAddTreeAccessEmailRequest from '~/composables/scripts/familytree/addTreeAccessEmail'
import sendDeleteTreeRequest from '~/composables/scripts/familytree/deleteTree'
import sendDeleteTreeAccessEmailRequest from '~/composables/scripts/familytree/deleteTreeAccessEmail'
import type PersonDTO from '~/composables/scripts/familytree/dtos/inner/PersonDTO'
import type TreeDTO from '~/composables/scripts/familytree/dtos/inner/TreeDTO'
import type { ListTreeAccessEmailsResponse } from '~/composables/scripts/familytree/dtos/responses/ListTreeAccessEmailsResponse'
import type { UpdateTreeSettingsResponse } from '~/composables/scripts/familytree/dtos/responses/UpdateTreeSettingsResponse'
import sendListTreeAccessEmailsRequest from '~/composables/scripts/familytree/listTreeAccessEmails'
import sendUpdateTreeSettingsRequest from '~/composables/scripts/familytree/updateTreeSettings'
import sendGetTreeAvatarRequest from '~/composables/scripts/photos/getTreeAvatar'
import sendUploadTreeAvatarRequest from '~/composables/scripts/photos/uploadTreeAvatar'
import { getTreePersonId } from '~/composables/scripts/tree/resolveTreeRootPersonId'
import showApiErrorToast from '~/composables/scripts/ui/showApiErrorToast'

export type TreeSidebarSection = 'settings' | 'events' | 'timeline'

type PersonOption = {
  label: string
  value: string
}

const props = defineProps<{
  treeId: string
  tree: TreeDTO | null
  persons: PersonDTO[]
  editable: boolean
  pending?: boolean
  section: TreeSidebarSection
}>()

const emit = defineEmits<{
  treeUpdated: [tree: TreeDTO]
  treeDeleted: []
}>()

const toast = useToast()

const isSettingsSaving = ref(false)
const isDeletingTree = ref(false)
const accessEmailPending = ref(false)
const accessEmails = ref<string[]>([])
const avatarFileInput = ref<HTMLInputElement | null>(null)
const avatarCropper = ref<{ exportFile: (fileName?: string, size?: number) => Promise<File> } | null>(null)
const avatarSourceUrl = ref<string | null>(null)
const avatarChanged = ref(false)

const events = ref<EventDTO[]>([])
const eventTypes = ref<EventTypeDTO[]>([])
const isEventsLoading = ref(false)

const treeName = ref('')
const treeDescription = ref('')
const isPublicOnMainPage = ref(false)
const isViewRestricted = ref(false)
const accessEmail = ref('')

const eventModalOpen = ref(false)
const eventTypeModalOpen = ref(false)
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
const isEventTypeSaving = ref(false)

const eventTypeName = ref('')
const eventTypePrimaryPersonsCount = ref(1)
const eventTypePrimaryPersonsMode = ref('PRIMARY_PERSONS_MODE_EXACT')
const timelineDateFrom = ref('')
const timelineDateTo = ref('')
const timelinePersonIds = ref<string[]>([])
const timelineWindowStart = ref(0)

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

const primaryModeOptions = [
  { value: 'PRIMARY_PERSONS_MODE_EXACT', label: 'Exact count' },
  { value: 'PRIMARY_PERSONS_MODE_AT_LEAST', label: 'At least' }
]

const personOptions = computed<PersonOption[]>(() => {
  return props.persons
    .map((person) => {
      const personId = getTreePersonId(person) ?? ''
      const label = [person.first_name, person.last_name].filter(Boolean).join(' ') || 'Unnamed person'

      return {
        label,
        value: personId
      }
    })
    .filter(person => Boolean(person.value))
})

const additionalPersonOptions = computed(() => {
  return personOptions.value.filter(person => !primaryPersonIds.value.includes(person.value))
})

const selectedPrimaryPeople = computed(() => {
  return primaryPersonIds.value.map((id) => {
    return {
      id,
      label: personNameById.value.get(id) ?? id,
      role: 'primary' as const
    }
  })
})

const selectedAdditionalPeople = computed(() => {
  return additionalPersonIds.value.map((id) => {
    return {
      id,
      label: personNameById.value.get(id) ?? id,
      role: 'additional' as const
    }
  })
})

const personNameById = computed(() => new Map(personOptions.value.map(person => [person.value, person.label])))
const eventTypeById = computed(() => new Map(eventTypes.value.map(eventType => [eventType.id ?? '', eventType])))
const selectedEventType = computed(() => eventTypeById.value.get(selectedEventTypeId.value))
const eventModalTitle = computed(() => editingEventId.value ? 'Edit event' : 'Create event')
const eventModalDescription = computed(() => editingEventId.value
  ? 'Update event type, date and participants.'
  : 'Choose a type, date and participants.'
)

const panelTitle = computed(() => {
  if (props.section === 'settings') {
    return 'Tree settings'
  }

  if (props.section === 'timeline') {
    return 'Timeline'
  }

  return 'Events'
})

const panelDescription = computed(() => {
  return props.section === 'settings'
    ? 'Visibility, access and destructive actions for this tree.'
    : props.section === 'timeline'
      ? 'Build a date range and inspect the tree timeline.'
      : 'Create events and manage event types for this tree.'
})

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

function formatEventTypePeopleRule(eventType: EventTypeDTO) {
  const count = eventType.primary_persons_count ?? 0
  const mode = eventType.primary_persons_mode ?? ''

  if (mode.includes('UNLIMITED')) {
    return count > 0 ? `${count}+` : 'Any'
  }

  if (mode.includes('AT_LEAST')) {
    return `${count}+`
  }

  if (mode.includes('EXACT')) {
    return String(count)
  }

  return count > 0 ? String(count) : 'Any'
}

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
    .map((event) => Number(event.date_iso?.slice(0, 4)))
    .filter((year) => Number.isFinite(year))

  if (!years.length) {
    return [] as number[]
  }

  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)
  const result: number[] = []

  for (let year = minYear; year <= maxYear; year += 1) {
    result.push(year)
  }

  return result
})

const visibleTimelineSpan = computed(() => Math.max(6, Math.min(10, timelineYears.value.length || 6)))
const maxTimelineWindowStart = computed(() => Math.max(0, timelineYears.value.length - visibleTimelineSpan.value))
const visibleTimelineYears = computed(() => {
  return timelineYears.value.slice(
    timelineWindowStart.value,
    timelineWindowStart.value + visibleTimelineSpan.value
  )
})

const positionedTimelineEvents = computed(() => {
  const years = visibleTimelineYears.value

  if (!years.length) {
    return []
  }

  const minYear = years[0]
  const maxYear = years[years.length - 1]

  if (minYear == null || maxYear == null) {
    return []
  }

  const span = Math.max(1, maxYear - minYear)
  const slots = new Map<number, number>()

  return datedTimelineEvents.value
    .filter((event) => {
      const year = Number(event.date_iso?.slice(0, 4))
      return Number.isFinite(year) && year >= minYear && year <= maxYear
    })
    .map((event) => {
      const year = Number(event.date_iso?.slice(0, 4))
      const month = Number(event.date_iso?.slice(5, 7) || '1')
      const day = Number(event.date_iso?.slice(8, 10) || '1')
      const offset = year - minYear + (Math.max(month, 1) - 1) / 12 + (Math.max(day, 1) - 1) / 365
      const left = span === 0 ? 0 : (offset / span) * 100
      const stackIndex = slots.get(year) ?? 0

      slots.set(year, stackIndex + 1)

      return {
        ...event,
        left: `${Math.min(100, Math.max(0, left))}%`,
        stackIndex
  }
})

watch(isPublicOnMainPage, (isPublic) => {
  if (isPublic) {
    isViewRestricted.value = false
  }
})
})

function syncTreeSettings() {
  treeName.value = props.tree?.name ?? props.tree?.title ?? ''
  treeDescription.value = props.tree?.description ?? ''
  isPublicOnMainPage.value = Boolean(props.tree?.is_public_on_main_page)
  isViewRestricted.value = Boolean(props.tree?.is_view_restricted)
}

function revokeAvatarSourceUrl() {
  if (!avatarSourceUrl.value?.startsWith('blob:')) {
    return
  }

  URL.revokeObjectURL(avatarSourceUrl.value)
}

function resetAvatarInput() {
  if (avatarFileInput.value) {
    avatarFileInput.value.value = ''
  }
}

async function loadTreeAvatar() {
  revokeAvatarSourceUrl()
  avatarSourceUrl.value = null
  avatarChanged.value = false
  resetAvatarInput()

  if (!props.treeId) {
    return
  }

  try {
    const avatarBlob = await sendGetTreeAvatarRequest(props.treeId)
    avatarSourceUrl.value = URL.createObjectURL(avatarBlob)
  } catch {
    avatarSourceUrl.value = null
  }
}

async function handleAvatarFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    toast.add({
      title: 'Please choose an image file',
      color: 'error'
    })
    input.value = ''
    return
  }

  revokeAvatarSourceUrl()
  avatarSourceUrl.value = URL.createObjectURL(file)
  avatarChanged.value = true
}

async function buildAvatarFile() {
  if (!avatarChanged.value || !avatarCropper.value) {
    return null
  }

  return await avatarCropper.value.exportFile('tree-avatar.png', 512)
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

function resetEventTypeForm() {
  eventTypeName.value = ''
  eventTypePrimaryPersonsCount.value = 1
  eventTypePrimaryPersonsMode.value = 'PRIMARY_PERSONS_MODE_EXACT'
}

function formatEventTypeLabel(eventTypeId?: string) {
  return eventTypeById.value.get(eventTypeId ?? '')?.name ?? 'Unknown type'
}

function formatEventDate(event: EventDTO) {
  if (event.date_unknown) {
    return 'Unknown date'
  }

  return formatTimelineDate(event)
}

function formatPeople(ids?: string[]) {
  if (!ids?.length) {
    return 'None'
  }

  return ids.map(id => personNameById.value.get(id) ?? id).join(', ')
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

function moveTimelineWindow(direction: -1 | 1) {
  timelineWindowStart.value = Math.max(
    0,
    Math.min(maxTimelineWindowStart.value, timelineWindowStart.value + direction)
  )
}

function getTimelineYearLeft(year: number) {
  const years = visibleTimelineYears.value
  const firstYear = years[0]
  const lastYear = years[years.length - 1]

  if (firstYear == null || lastYear == null) {
    return '0%'
  }

  if (years.length === 1) {
    return '50%'
  }

  return `${((year - firstYear) / Math.max(1, lastYear - firstYear)) * 100}%`
}

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

function openCreateEventModal() {
  resetEventForm()
  eventModalOpen.value = true
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

async function loadAccessEmails() {
  if (!props.editable || !props.treeId) {
    accessEmails.value = []
    return
  }

  const response = await sendListTreeAccessEmailsRequest(props.treeId) as DataDTO<ListTreeAccessEmailsResponse>
  accessEmails.value = Array.isArray(response.data?.emails) ? response.data.emails : []
}

async function loadEventsData() {
  if (!props.treeId) {
    return
  }

  isEventsLoading.value = true

  try {
    const [eventsResponse, eventTypesResponse] = await Promise.all([
      sendListEventsRequest(props.treeId) as Promise<DataDTO<ListEventsResponse>>,
      sendListEventTypesRequest() as Promise<DataDTO<ListEventTypesResponse>>
    ])

    events.value = Array.isArray(eventsResponse.data?.events) ? eventsResponse.data.events : []
    eventTypes.value = Array.isArray(eventTypesResponse.data?.event_types) ? eventTypesResponse.data.event_types : []

    if (!eventTypes.value.some(eventType => eventType.id === selectedEventTypeId.value)) {
      selectedEventTypeId.value = eventTypes.value[0]?.id ?? ''
    }
  } finally {
    isEventsLoading.value = false
  }
}

async function saveTreeSettings() {
  if (isSettingsSaving.value || !props.treeId) {
    return
  }

  isSettingsSaving.value = true

  try {
    const response = await sendUpdateTreeSettingsRequest(
      props.treeId,
      isPublicOnMainPage.value,
      isViewRestricted.value,
      treeName.value.trim() || undefined,
      treeDescription.value.trim() || undefined
    ) as DataDTO<UpdateTreeSettingsResponse>

    const avatarFile = await buildAvatarFile()

    if (avatarFile) {
      await sendUploadTreeAvatarRequest(props.treeId, avatarFile)
      avatarChanged.value = false
    }

    await loadTreeAvatar()

    const updatedTree = response.data?.tree

    if (updatedTree) {
      emit('treeUpdated', updatedTree)
    }

    await loadAccessEmails()

    toast.add({
      title: 'Tree settings updated',
      color: 'success'
    })
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    isSettingsSaving.value = false
  }
}

async function addAccessEmail() {
  if (accessEmailPending.value || !props.treeId || !accessEmail.value.trim()) {
    return
  }

  accessEmailPending.value = true

  try {
    await sendAddTreeAccessEmailRequest(props.treeId, accessEmail.value.trim())
    accessEmail.value = ''
    await loadAccessEmails()
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    accessEmailPending.value = false
  }
}

async function deleteAccessEmail(email: string) {
  if (accessEmailPending.value || !props.treeId) {
    return
  }

  accessEmailPending.value = true

  try {
    await sendDeleteTreeAccessEmailRequest(props.treeId, email)
    await loadAccessEmails()
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    accessEmailPending.value = false
  }
}

async function deleteTree() {
  if (isDeletingTree.value || !props.treeId) {
    return
  }

  const confirmed = window.confirm(`Delete tree "${props.tree?.name ?? props.tree?.title ?? props.treeId}"?`)

  if (!confirmed) {
    return
  }

  isDeletingTree.value = true

  try {
    await sendDeleteTreeRequest(props.treeId)
    emit('treeDeleted')
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    isDeletingTree.value = false
  }
}

async function createEvent() {
  if (isEventSaving.value || !props.treeId || !canSubmitEvent.value) {
    return
  }

  isEventSaving.value = true

  try {
    const isEditing = Boolean(editingEventId.value)
    const eventRequestPayload = [
      props.treeId,
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
        props.treeId,
        editingEventId.value,
        new UpdateEventRequest(...eventRequestPayload)
      )
    } else {
      await sendCreateEventRequest(
        props.treeId,
        new CreateEventRequest(...eventRequestPayload)
      )
    }

    eventModalOpen.value = false
    resetEventForm()
    await loadEventsData()

    toast.add({
      title: isEditing ? 'Event updated' : 'Event created',
      color: 'success'
    })
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    isEventSaving.value = false
  }
}

async function createEventType() {
  if (isEventTypeSaving.value || !eventTypeName.value.trim()) {
    return
  }

  isEventTypeSaving.value = true

  try {
    await sendCreateEventTypeRequest(
      eventTypeName.value.trim(),
      Math.max(0, Number(eventTypePrimaryPersonsCount.value) || 0),
      eventTypePrimaryPersonsMode.value
    )

    eventTypeModalOpen.value = false
    resetEventTypeForm()
    await loadEventsData()

    toast.add({
      title: 'Event type created',
      color: 'success'
    })
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    isEventTypeSaving.value = false
  }
}

async function deleteEventType(eventTypeId: string) {
  try {
    await sendDeleteEventTypeRequest(eventTypeId)
    await loadEventsData()
  } catch (error) {
    showApiErrorToast(error)
  }
}

async function deleteEvent(eventId: string) {
  if (!props.treeId) {
    return
  }

  try {
    await sendDeleteEventRequest(props.treeId, eventId)
    await loadEventsData()
  } catch (error) {
    showApiErrorToast(error)
  }
}

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

watch(
  () => props.tree,
  () => {
    syncTreeSettings()
  },
  { immediate: true }
)

watch(
  () => props.treeId,
  async () => {
    await Promise.all([
      loadTreeAvatar(),
      loadAccessEmails(),
      loadEventsData()
    ])
  },
  { immediate: true }
)

watch(
  () => props.section,
  async (section) => {
    if (section !== 'settings') {
      return
    }

    await Promise.all([
      loadTreeAvatar(),
      loadAccessEmails()
    ])
  }
)

watch(
  () => [timelineDateFrom.value, timelineDateTo.value, timelinePersonIds.value.join(','), events.value.length],
  () => {
    timelineWindowStart.value = 0
  }
)

onBeforeUnmount(() => {
  revokeAvatarSourceUrl()
})
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-4">
    <header v-if="props.section === 'timeline'" class="border-b border-default pb-4">
      <p class="text-sm font-semibold text-highlighted">
        {{ panelTitle }}
      </p>
      <p class="mt-1 text-xs text-muted">
        {{ panelDescription }}
      </p>
    </header>

    <div v-if="props.pending" class="flex flex-1 flex-col gap-4 overflow-y-auto pb-2">
      <div class="rounded-xl border border-default p-4">
        <USkeleton class="h-5 w-40 rounded" />
        <USkeleton class="mt-3 h-10 rounded-lg" />
        <USkeleton class="mt-3 h-10 rounded-lg" />
        <USkeleton class="mt-3 h-10 rounded-lg" />
      </div>
      <div class="rounded-xl border border-default p-4">
        <USkeleton class="h-5 w-32 rounded" />
        <USkeleton class="mt-3 h-24 rounded-xl" />
      </div>
    </div>

    <div
      v-else-if="props.section === 'settings'"
      class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2"
    >
      <section class="rounded-xl border border-default bg-default p-4">
        <div class="flex w-full flex-col gap-3">
          <UInput
            v-model="treeName"
            color="neutral"
            variant="subtle"
            placeholder="Tree name"
            class="w-full"
            :disabled="!editable"
            :ui="treeFieldUi"
          />

          <UTextarea
            v-model="treeDescription"
            :rows="4"
            autoresize
            color="neutral"
            variant="subtle"
            placeholder="Tree description"
            class="w-full"
            :disabled="!editable"
            :ui="treeTextareaUi"
          />

          <UCheckbox
            v-model="isPublicOnMainPage"
            label="Public on main page"
            :disabled="!editable"
          />

          <UCheckbox
            v-model="isViewRestricted"
            label="Restricted view"
            :disabled="!editable || isPublicOnMainPage"
          />

          <div class="space-y-3 rounded-2xl border border-default bg-default p-4">
            <div class="flex flex-row items-center gap-3">
              <p class="text-sm font-medium text-highlighted">
                Tree avatar
              </p>
              <UButton
                type="button"
                color="neutral"
                variant="subtle"
                :disabled="!editable"
                class="ml-auto w-fit"
                @click="avatarFileInput?.click()"
              >
                Choose image
              </UButton>
            </div>

            <input
              ref="avatarFileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarFileChange"
            >

            <div
              v-if="avatarSourceUrl"
              class="space-y-3"
            >
              <div class="tree-avatar-cropper mx-auto overflow-hidden rounded-4xl border border-default bg-elevated/70">
                <AvatarCropper
                  ref="avatarCropper"
                  :src="avatarSourceUrl"
                  :aspect-ratio="3 / 4"
                  class="mx-auto block h-full w-full object-contain"
                />
              </div>
            </div>
          </div>

          <UButton
            color="primary"
            variant="soft"
            class="w-fit"
            :disabled="!editable"
            :loading="isSettingsSaving"
            @click="saveTreeSettings"
          >
            Save changes
          </UButton>
        </div>
      </section>

      <section class="rounded-xl border border-default p-4">
        <div>
          <p class="text-sm font-semibold text-highlighted">
            Access list
          </p>
          <p class="mt-1 text-xs text-muted">
            Manage email-based access to this tree.
          </p>
        </div>

        <div class="mt-4 flex gap-2">
          <UInput
            v-model="accessEmail"
            color="neutral"
            variant="subtle"
            placeholder="user@example.com"
            :disabled="!editable"
            :ui="treeFieldUi"
          />
          <UButton
            color="neutral"
            variant="soft"
            :disabled="!editable"
            :loading="accessEmailPending"
            @click="addAccessEmail"
          >
            Add
          </UButton>
        </div>

        <div v-if="accessEmails.length" class="mt-4 flex flex-col gap-2">
          <div
            v-for="email in accessEmails"
            :key="email"
            class="flex items-center justify-between gap-2 rounded-lg border border-default bg-tree-panel-item-bg px-3 py-2"
          >
            <span class="min-w-0 truncate text-sm text-highlighted">{{ email }}</span>
            <UButton
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              :disabled="!editable"
              @click="deleteAccessEmail(email)"
            />
          </div>
        </div>

        <p v-else class="mt-4 text-sm text-muted">
          No access emails configured.
        </p>
      </section>

      <section class="rounded-xl border border-red-500/30 p-4">
        <div>
          <p class="text-sm font-semibold text-highlighted">
            Danger zone
          </p>
          <p class="mt-1 text-xs text-muted">
            This action permanently removes the tree.
          </p>
        </div>

        <UButton
          class="mt-4"
          color="error"
          variant="soft"
          :disabled="!editable"
          :loading="isDeletingTree"
          @click="deleteTree"
        >
          Delete tree
        </UButton>
      </section>
    </div>

    <div v-else-if="props.section === 'events'" class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
      <section class="rounded-xl border border-default p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-highlighted">
              Event types
            </p>
            <p class="mt-1 text-xs text-muted">
              Reusable templates for event creation.
            </p>
          </div>
          <UButton
            color="neutral"
            variant="subtle"
            icon="i-lucide-badge-plus"
            :disabled="!editable"
            @click="eventTypeModalOpen = true"
          >
            Type
          </UButton>
        </div>

        <div v-if="isEventsLoading" class="mt-4 flex flex-col gap-2">
          <USkeleton class="h-16 rounded-lg" />
          <USkeleton class="h-16 rounded-lg" />
        </div>

        <div v-else-if="eventTypes.length" class="mt-4 flex flex-col gap-2">
          <article
            v-for="eventType in eventTypes"
            :key="eventType.id"
            class="group flex items-center justify-between gap-2 rounded-lg border border-default bg-tree-panel-item-bg px-3 py-2"
          >
            <div class="min-w-0">
              <p class="truncate text-sm text-highlighted">
                {{ eventType.name || 'Unnamed type' }}
              </p>
              <p class="text-xs text-muted">
                People count: {{ formatEventTypePeopleRule(eventType) }}
              </p>
            </div>
            <UButton
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              class="opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
              :disabled="!editable || !eventType.id"
              @click="eventType.id && deleteEventType(eventType.id)"
            />
          </article>
        </div>

        <p v-else class="mt-4 rounded-lg border border-default bg-tree-panel-item-bg px-3 py-3 text-sm text-muted">
          No event types available.
        </p>
      </section>

      <section class="rounded-xl border border-default p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-highlighted">
              Events
            </p>
            <p class="mt-1 text-xs text-muted">
              Timeline entries attached to this tree.
            </p>
          </div>
          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-calendar-plus"
            :disabled="!editable"
            @click="openCreateEventModal"
          >
            Event
          </UButton>
        </div>

        <div v-if="isEventsLoading" class="mt-4 flex flex-col gap-2">
          <USkeleton class="h-20 rounded-lg" />
          <USkeleton class="h-20 rounded-lg" />
          <USkeleton class="h-20 rounded-lg" />
        </div>

        <div v-else-if="events.length" class="mt-4 flex flex-col gap-2">
          <article
            v-for="event in events"
            :key="event.id || event.event_id"
            class="group rounded-lg border border-default bg-tree-panel-item-bg px-3 py-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ formatEventTypeLabel(event.event_type_id) }}
                </p>
                <p class="mt-1 text-xs text-muted">
                  {{ formatEventDate(event) }}
                </p>
                <p class="mt-2 text-xs text-muted">
                  Primary: {{ formatPeople(event.primary_person_ids) }}
                </p>
                <p class="mt-1 text-xs text-muted">
                  Additional: {{ formatPeople(event.additional_person_ids) }}
                </p>
              </div>
              <div class="flex items-center gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-pencil"
                  :disabled="!editable || !(event.id || event.event_id)"
                  @click="openEditEventModal(event)"
                />
                <UButton
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  :disabled="!editable || !(event.id || event.event_id)"
                  @click="(event.id || event.event_id) && deleteEvent((event.id || event.event_id) as string)"
                />
              </div>
            </div>
          </article>
        </div>

        <p v-else class="mt-4 rounded-lg border border-default bg-tree-panel-item-bg px-3 py-3 text-sm text-muted">
          No events created yet.
        </p>
      </section>
    </div>

    <div v-else class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
      <section class="rounded-xl border border-default p-4">
        <div>
          <p class="text-sm font-semibold text-highlighted">
            Timeline filters
          </p>
          <p class="mt-1 text-xs text-muted">
            Limit the timeline by dates and by people related to events.
          </p>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <UInput
            v-model="timelineDateFrom"
            type="date"
            color="neutral"
            variant="subtle"
            placeholder="From"
            :ui="treeFieldUi"
          />
          <UInput
            v-model="timelineDateTo"
            type="date"
            color="neutral"
            variant="subtle"
            placeholder="To"
            :ui="treeFieldUi"
          />
        </div>

        <div class="mt-3 space-y-2">
          <p class="text-sm text-muted">
            People in timeline
          </p>
          <USelectMenu
            v-model="timelinePersonIds"
            multiple
            :items="personOptions"
            value-key="value"
            label-key="label"
            placeholder="Choose people"
            color="neutral"
            variant="subtle"
            :ui="treeSelectMenuUi"
          />
        </div>

        <div v-if="timelinePersonIds.length" class="mt-3 flex flex-wrap items-center gap-2">
          <UBadge
            v-for="personId in timelinePersonIds"
            :key="`timeline-filter-${personId}`"
            color="primary"
            variant="subtle"
            class="rounded-full border border-primary/40 px-3 py-1"
          >
            {{ personNameById.get(personId) ?? personId }}
          </UBadge>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          <UBadge color="neutral" variant="subtle">
            {{ filteredTimelineEvents.length }} events
          </UBadge>
          <span>Striped cards mark approximate dates.</span>
        </div>
      </section>

      <section class="rounded-xl border border-default p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-highlighted">
              Timeline
            </p>
            <p class="mt-1 text-xs text-muted">
              Horizontal scale from older to newer.
            </p>
          </div>
        </div>

        <div v-if="isEventsLoading" class="mt-4 flex flex-col gap-3">
          <USkeleton class="h-24 rounded-xl" />
          <USkeleton class="h-24 rounded-xl" />
          <USkeleton class="h-24 rounded-xl" />
        </div>

        <div v-else-if="datedTimelineEvents.length" class="mt-5 space-y-4">
          <div class="timeline-board rounded-2xl border border-default px-4 py-6">
            <div class="flex items-center justify-between gap-3">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-chevron-left"
                :disabled="timelineWindowStart === 0"
                @click="moveTimelineWindow(-1)"
              />

              <div class="timeline-stage">
                <div
                  v-for="event in positionedTimelineEvents"
                  :key="`timeline-${event.id || event.event_id}`"
                  class="timeline-event-card absolute"
                  :class="{ 'timeline-event-card--approximate': isApproximateEvent(event) }"
                  :style="{
                    left: event.left,
                    bottom: `${5.25 + event.stackIndex * 3.9}rem`
                  }"
                >
                  <div class="rounded-lg border border-default bg-[var(--timeline-event-card-bg)] px-3 py-2 shadow-sm">
                    <p class="text-xs font-semibold text-highlighted">
                      {{ formatEventTypeLabel(event.event_type_id) }}
                    </p>
                    <p class="mt-1 text-[11px] text-muted">
                      {{ formatTimelineDate(event) }}
                    </p>
                  </div>
                  <div class="timeline-event-card__stem" />
                </div>

                <div class="timeline-axis" />

                <div
                  v-for="year in visibleTimelineYears"
                  :key="`timeline-year-${year}`"
                  class="timeline-year-marker"
                  :style="{ left: getTimelineYearLeft(year) }"
                >
                  <div class="timeline-year-marker__tick" />
                  <span class="timeline-year-marker__label">{{ year }}</span>
                </div>
              </div>

              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-chevron-right"
                :disabled="timelineWindowStart >= maxTimelineWindowStart"
                @click="moveTimelineWindow(1)"
              />
            </div>
          </div>

          <div v-if="undatedTimelineEvents.length" class="rounded-xl border border-default p-4">
            <p class="text-sm font-semibold text-highlighted">
              Undated or unknown-date events
            </p>
            <div class="mt-3 flex flex-col gap-2">
              <article
                v-for="event in undatedTimelineEvents"
                :key="`timeline-undated-${event.id || event.event_id}`"
                class="timeline-undated-card rounded-lg border px-3 py-3"
                :class="{ 'timeline-item--approximate': isApproximateEvent(event) }"
              >
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-highlighted">
                      {{ formatEventTypeLabel(event.event_type_id) }}
                    </p>
                    <p class="mt-1 text-xs text-muted">
                      {{ formatTimelineDate(event) }}
                    </p>
                  </div>
                  <UBadge color="warning" variant="subtle">
                    Approximate
                  </UBadge>
                </div>
              </article>
            </div>
          </div>
        </div>

        <p v-else class="mt-4 text-sm text-muted">
          No events match the selected date range.
        </p>
      </section>
    </div>

    <UModal
      v-model:open="eventModalOpen"
      :title="eventModalTitle"
      :description="eventModalDescription"
      :ui="{
        content: 'bg-default flex flex-col focus:outline-none'
      }"
    >
      <template #body>
        <div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <div class="flex items-start justify-between gap-6">
            <label class="pt-2 text-sm text-muted">Event type</label>
            <USelect
              v-model="selectedEventTypeId"
              :items="eventTypes.map(eventType => ({ label: eventType.name || 'Unnamed type', value: eventType.id || '' }))"
              value-key="value"
              placeholder="Choose event type"
              color="neutral"
              variant="subtle"
              class="min-w-72 max-w-full"
              :ui="treeSelectUi"
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
              :ui="treeFieldUi"
            />

            <div v-else-if="eventDatePrecision === 'MONTH'" class="grid gap-3 sm:grid-cols-2">
              <UInput
                v-model="eventDateMonth"
                type="number"
                min="1"
                max="12"
                color="neutral"
                variant="subtle"
                placeholder="MM"
                :ui="treeFieldUi"
              />
              <UInput
                v-model="eventDateYear"
                type="number"
                min="1"
                max="9999"
                color="neutral"
                variant="subtle"
                placeholder="YYYY"
                :ui="treeFieldUi"
              />
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
              :ui="treeFieldUi"
            />

            <USelect
              v-model="eventDatePrecision"
              :items="precisionOptions"
              value-key="value"
              placeholder="Choose date precision"
              color="neutral"
              variant="subtle"
              :ui="treeSelectUi"
              @update:model-value="handleEventPrecisionChange"
            />

            <USelect
              v-model="eventDateBound"
              :items="boundOptions"
              value-key="value"
              placeholder="Choose date bound"
              color="neutral"
              variant="subtle"
              :ui="treeSelectUi"
            />
          </div>

          <div class="space-y-2">
            <p class="text-sm text-muted">
              Primary people
            </p>
            <USelectMenu
              v-model="primaryPersonIds"
              multiple
              :items="personOptions"
              value-key="value"
              label-key="label"
              placeholder="Choose primary people"
              color="neutral"
              variant="subtle"
              :ui="treeSelectMenuUi"
            />
            <p v-if="primaryCountError" class="text-xs text-error">
              {{ primaryCountError }}
            </p>
          </div>

          <div class="space-y-2">
            <p class="text-sm text-muted">
              Additional people
            </p>
            <USelectMenu
              v-model="additionalPersonIds"
              multiple
              :items="additionalPersonOptions"
              value-key="value"
              label-key="label"
              placeholder="Choose additional people"
              color="neutral"
              variant="subtle"
              :ui="treeSelectMenuUi"
            />
          </div>

          <div v-if="selectedPrimaryPeople.length || selectedAdditionalPeople.length" class="rounded-xl border border-default bg-settings-section-bg p-3">
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
            <UButton
              color="primary"
              variant="soft"
              :loading="isEventSaving"
              :disabled="!canSubmitEvent"
              @click="createEvent"
            >
              {{ editingEventId ? 'Save event' : 'Create event' }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="eventTypeModalOpen"
      title="Create event type"
      description="Add a reusable event template."
      :ui="{
        content: 'bg-default flex flex-col focus:outline-none'
      }"
    >
      <template #body>
        <div class="mx-auto flex w-full max-w-xl flex-col gap-4">
          <UInput
            v-model="eventTypeName"
            color="neutral"
            variant="subtle"
            placeholder="Type name"
            :ui="treeFieldUi"
          />

          <UInput
            v-model="eventTypePrimaryPersonsCount"
            type="number"
            min="0"
            color="neutral"
            variant="subtle"
            placeholder="Primary persons count"
            :ui="treeFieldUi"
          />

          <USelect
            v-model="eventTypePrimaryPersonsMode"
            :items="primaryModeOptions"
            value-key="value"
            placeholder="Choose primary people rule"
            color="neutral"
            variant="subtle"
            :ui="treeSelectUi"
          />

          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="eventTypeModalOpen = false">
              Cancel
            </UButton>
            <UButton color="primary" variant="soft" :loading="isEventTypeSaving" @click="createEventType">
              Create type
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.tree-avatar-cropper {
  width: 100%;
  min-height: 20rem;
  max-height: 28rem;
}

.tree-avatar-cropper :deep(.vue-advanced-cropper) {
  height: 100%;
  min-height: 20rem;
}

.timeline-list {
  position: relative;
}

.timeline-board {
  background: var(--color-timeline-board-bg);
}

.timeline-stage {
  position: relative;
  flex: 1;
  min-height: 15rem;
  overflow: hidden;
}

.timeline-axis {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 2.75rem;
  border-top: 1px dashed var(--color-timeline-axis);
}

.timeline-year-marker {
  position: absolute;
  bottom: 0;
  transform: translateX(-50%);
}

.timeline-year-marker__tick {
  margin: 0 auto;
  height: 0.9rem;
  width: 1px;
  background: var(--color-timeline-tick);
}

.timeline-year-marker__label {
  display: block;
  margin-top: 0.45rem;
  font-size: 0.72rem;
  color: var(--ui-text-muted);
}

.timeline-event-card {
  position: absolute;
  width: 10rem;
  transform: translateX(-50%);
}

.timeline-event-card__stem {
  margin: 0.35rem auto 0;
  height: 1.85rem;
  width: 1px;
  border-left: 1px dashed var(--color-timeline-stem);
}

.timeline-event-card--approximate > div:first-child,
.timeline-item--approximate {
  background:
    repeating-linear-gradient(
      -45deg,
      var(--color-timeline-approximate-stripe) 0,
      var(--color-timeline-approximate-stripe) 8px,
      transparent 8px,
      transparent 16px
    ),
    var(--color-timeline-approximate-bg) !important;
}

.timeline-undated-card {
  border-color: var(--color-timeline-undated-border);
  background: var(--color-timeline-undated-bg);
}
</style>
