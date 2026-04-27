<script setup lang="ts">
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
import sendAddTreeAccessEmailRequest from '~/composables/scripts/familytree/addTreeAccessEmail'
import sendDeleteTreeRequest from '~/composables/scripts/familytree/deleteTree'
import sendDeleteTreeAccessEmailRequest from '~/composables/scripts/familytree/deleteTreeAccessEmail'
import type PersonDTO from '~/composables/scripts/familytree/dtos/inner/PersonDTO'
import type TreeDTO from '~/composables/scripts/familytree/dtos/inner/TreeDTO'
import type { ListTreeAccessEmailsResponse } from '~/composables/scripts/familytree/dtos/responses/ListTreeAccessEmailsResponse'
import type { UpdateTreeSettingsResponse } from '~/composables/scripts/familytree/dtos/responses/UpdateTreeSettingsResponse'
import sendListTreeAccessEmailsRequest from '~/composables/scripts/familytree/listTreeAccessEmails'
import sendUpdateTreeSettingsRequest from '~/composables/scripts/familytree/updateTreeSettings'
import { getTreePersonId } from '~/composables/scripts/tree/resolveTreeRootPersonId'
import showApiErrorToast from '~/composables/scripts/ui/showApiErrorToast'

export type TreeSidebarSection = 'settings' | 'events'

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

const events = ref<EventDTO[]>([])
const eventTypes = ref<EventTypeDTO[]>([])
const isEventsLoading = ref(false)

const treeName = ref('')
const isPublicOnMainPage = ref(false)
const isViewRestricted = ref(false)
const accessEmail = ref('')

const eventModalOpen = ref(false)
const eventTypeModalOpen = ref(false)
const selectedEventTypeId = ref('')
const eventDateIso = ref('')
const eventDatePrecision = ref('DATE_PRECISION_EXACT')
const eventDateBound = ref('DATE_BOUND_NONE')
const eventDateUnknown = ref(false)
const primaryPersonIds = ref<string[]>([])
const additionalPersonIds = ref<string[]>([])
const isEventSaving = ref(false)
const isEventTypeSaving = ref(false)

const eventTypeName = ref('')
const eventTypePrimaryPersonsCount = ref(1)
const eventTypePrimaryPersonsMode = ref('PRIMARY_PERSONS_MODE_EXACT')

const precisionOptions = [
  { value: 'DATE_PRECISION_EXACT', label: 'Exact date' },
  { value: 'DATE_PRECISION_MONTH', label: 'Month' },
  { value: 'DATE_PRECISION_YEAR', label: 'Year' }
]

const boundOptions = [
  { value: 'DATE_BOUND_NONE', label: 'No bound' },
  { value: 'DATE_BOUND_BEFORE', label: 'Before' },
  { value: 'DATE_BOUND_AFTER', label: 'After' }
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

const panelTitle = computed(() => props.section === 'settings' ? 'Tree settings' : 'Events')
const panelDescription = computed(() => {
  return props.section === 'settings'
    ? 'Visibility, access and destructive actions for this tree.'
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
    && (eventDateUnknown.value || Boolean(eventDateIso.value))
})

function syncTreeSettings() {
  treeName.value = props.tree?.name ?? props.tree?.title ?? ''
  isPublicOnMainPage.value = Boolean(props.tree?.is_public_on_main_page)
  isViewRestricted.value = Boolean(props.tree?.is_view_restricted)
}

function resetEventForm() {
  selectedEventTypeId.value = eventTypes.value[0]?.id ?? ''
  eventDateIso.value = ''
  eventDatePrecision.value = 'DATE_PRECISION_EXACT'
  eventDateBound.value = 'DATE_BOUND_NONE'
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

  return event.date_iso || 'No date'
}

function formatPeople(ids?: string[]) {
  if (!ids?.length) {
    return 'None'
  }

  return ids.map(id => personNameById.value.get(id) ?? id).join(', ')
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
      treeName.value.trim() || undefined
    ) as DataDTO<UpdateTreeSettingsResponse>

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
    await sendCreateEventRequest(
      props.treeId,
      new CreateEventRequest(
        props.treeId,
        selectedEventTypeId.value,
        eventDateIso.value,
        eventDatePrecision.value,
        eventDateUnknown.value,
        eventDateBound.value,
        primaryPersonIds.value,
        additionalPersonIds.value
      )
    )

    eventModalOpen.value = false
    resetEventForm()
    await loadEventsData()

    toast.add({
      title: 'Event created',
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
      loadAccessEmails(),
      loadEventsData()
    ])
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-4">
    <header class="border-b border-default pb-4">
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
      <section class="rounded-xl border border-default p-4">
        <div>
          <p class="text-sm font-semibold text-highlighted">
            General
          </p>
          <p class="mt-1 text-xs text-muted">
            Update tree name and visibility flags.
          </p>
        </div>

        <div class="mt-4 space-y-3">
          <UInput
            v-model="treeName"
            color="neutral"
            variant="subtle"
            placeholder="Tree name"
            :disabled="!editable"
          />

          <UCheckbox
            v-model="isPublicOnMainPage"
            label="Public on main page"
            :disabled="!editable"
          />

          <UCheckbox
            v-model="isViewRestricted"
            label="Restricted view"
            :disabled="!editable"
          />

          <UButton
            color="neutral"
            variant="soft"
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
            class="flex items-center justify-between gap-2 rounded-lg border border-default px-3 py-2"
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

      <section class="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
        <div>
          <p class="text-sm font-semibold text-red-300">
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

    <div v-else class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
      <section class="rounded-xl border border-default p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-highlighted">
              Event actions
            </p>
            <p class="mt-1 text-xs text-muted">
              Create events and extend the list of available event types.
            </p>
          </div>

          <div class="flex gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-badge-plus"
              :disabled="!editable"
              @click="eventTypeModalOpen = true"
            >
              Type
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-calendar-plus"
              :disabled="!editable"
              @click="eventModalOpen = true"
            >
              Event
            </UButton>
          </div>
        </div>
      </section>

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
          <UBadge color="neutral" variant="subtle">
            {{ eventTypes.length }}
          </UBadge>
        </div>

        <div v-if="isEventsLoading" class="mt-4 flex flex-col gap-2">
          <USkeleton class="h-16 rounded-lg" />
          <USkeleton class="h-16 rounded-lg" />
        </div>

        <div v-else-if="eventTypes.length" class="mt-4 flex flex-col gap-2">
          <article
            v-for="eventType in eventTypes"
            :key="eventType.id"
            class="flex items-center justify-between gap-2 rounded-lg border border-default px-3 py-2"
          >
            <div class="min-w-0">
              <p class="truncate text-sm text-highlighted">
                {{ eventType.name || 'Unnamed type' }}
              </p>
              <p class="text-xs text-muted">
                Primary people: {{ eventType.primary_persons_count ?? 0 }} / {{ eventType.primary_persons_mode ?? '—' }}
              </p>
            </div>
            <UButton
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              :disabled="!editable || !eventType.id"
              @click="eventType.id && deleteEventType(eventType.id)"
            />
          </article>
        </div>

        <p v-else class="mt-4 text-sm text-muted">
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
          <UBadge color="neutral" variant="subtle">
            {{ events.length }}
          </UBadge>
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
            class="rounded-lg border border-default px-3 py-3"
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
              <UButton
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                :disabled="!editable || !(event.id || event.event_id)"
                @click="(event.id || event.event_id) && deleteEvent((event.id || event.event_id) as string)"
              />
            </div>
          </article>
        </div>

        <p v-else class="mt-4 text-sm text-muted">
          No events created yet.
        </p>
      </section>
    </div>

    <UModal
      v-model:open="eventModalOpen"
      title="Create event"
      description="Choose a type, date and participants."
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
            <UInput v-model="eventDateIso" type="date" color="neutral" variant="subtle" />

            <USelect
              v-model="eventDatePrecision"
              :items="precisionOptions"
              value-key="value"
              placeholder="Choose date precision"
              color="neutral"
              variant="subtle"
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
            <UButton
              color="neutral"
              variant="soft"
              :loading="isEventSaving"
              :disabled="!canSubmitEvent"
              @click="createEvent"
            >
              Create event
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="eventTypeModalOpen"
      title="Create event type"
      description="Add a reusable event template."
    >
      <template #body>
        <div class="space-y-4">
          <UInput
            v-model="eventTypeName"
            color="neutral"
            variant="subtle"
            placeholder="Type name"
          />

          <UInput
            v-model="eventTypePrimaryPersonsCount"
            type="number"
            min="0"
            color="neutral"
            variant="subtle"
            placeholder="Primary persons count"
          />

          <USelect
            v-model="eventTypePrimaryPersonsMode"
            :items="primaryModeOptions"
            value-key="value"
            placeholder="Choose primary people rule"
            color="neutral"
            variant="subtle"
          />

          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="eventTypeModalOpen = false">
              Cancel
            </UButton>
            <UButton color="neutral" variant="soft" :loading="isEventTypeSaving" @click="createEventType">
              Create type
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
