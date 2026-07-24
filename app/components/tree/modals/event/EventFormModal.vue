<script setup lang="ts">
import { treeFieldUi, treeSelectUi, treeSelectMenuUi } from '~/utils/ui/theme/treeTheme'
import type EventDTO from '~/services/events/dtos/inner/EventDTO'
import type EventTypeDTO from '~/services/eventTypes/dtos/inner/EventTypeDTO'
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import CreateEventRequest from '~/services/events/dtos/requests/CreateEventRequest'
import UpdateEventRequest from '~/services/events/dtos/requests/UpdateEventRequest'
import sendCreateEventRequest from '~/services/events/createEvent'
import sendUpdateEventRequest from '~/services/events/updateEvent'
import { getTreePersonId } from '~/utils/ui/tree/resolveTreePersonId'
import showApiErrorToast from "~/utils/ui/notifications/showApiErrorToast";

const props = defineProps<{
  open: boolean
  treeId: string
  event: EventDTO | null
  eventTypes: EventTypeDTO[]
  persons: PersonDTO[]
}>()

const { t } = useI18n()

const emit = defineEmits(['update:open', 'saved'])

const isModalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const toast = useToast()
const isSaving = ref(false)

const form = reactive({
  id: '',
  eventTypeId: '',
  dateDay: '',
  dateMonth: '',
  dateYear: '',
  precision: 'DAY',
  bound: 'EXACT',
  isUnknown: false,
  primaryIds: [] as string[],
  additionalIds: [] as string[]
})

const precisionOptions = computed(() => [
  { value: 'DAY', label: t('tree.events.modal.precisions.day') },
  { value: 'MONTH', label: t('tree.events.modal.precisions.month') },
  { value: 'YEAR', label: t('tree.events.modal.precisions.year') }
])

const boundOptions = computed(() => [
  { value: 'EXACT', label: t('tree.events.modal.bounds.exact') },
  { value: 'NOT_BEFORE', label: t('tree.events.modal.bounds.not_before') },
  { value: 'NOT_AFTER', label: t('tree.events.modal.bounds.not_after') }
])

const personOptions = computed(() => props.persons.map(p => ({
  label: [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unnamed person',
  value: getTreePersonId(p) ?? ''
})).filter(p => p.value))

const additionalOptions = computed(() =>
  personOptions.value.filter(p => !form.primaryIds.includes(p.value))
)

const selectedType = computed(() => props.eventTypes.find(t => t.id === form.eventTypeId))

const primaryCountError = computed(() => {
  if (!selectedType.value) return undefined
  const count = selectedType.value.primary_persons_count ?? 0
  const mode = selectedType.value.primary_persons_mode ?? ''

  if (mode.includes('EXACT') && form.primaryIds.length !== count) {
    return `Choose exactly ${count} primary people.`
  }
  if (mode.includes('AT_LEAST') && form.primaryIds.length < count) {
    return `Choose at least ${count} primary people.`
  }
  return undefined
})

function buildIsoDate() {
  if (form.isUnknown) return ''
  if (form.precision === 'YEAR') return form.dateYear ? `${form.dateYear}-01-01` : ''
  if (form.precision === 'MONTH') {
    const m = String(form.dateMonth).padStart(2, '0')
    return (form.dateYear && form.dateMonth) ? `${form.dateYear}-${m}-01` : ''
  }
  return form.dateDay
}

function fillFormFromEvent(event: EventDTO) {
  form.id = String(event.id || event.event_id || '')
  form.eventTypeId = event.event_type_id ?? ''
  form.isUnknown = !!event.date_unknown
  form.precision = event.date_precision || 'DAY'
  form.bound = event.date_bound || 'EXACT'
  form.primaryIds = [...(event.primary_person_ids ?? [])]
  form.additionalIds = [...(event.additional_person_ids ?? [])]

  if (event.date_iso) {
    const [y, m, d] = event.date_iso.split('-')
    form.dateYear = y ?? ''
    form.dateMonth = m ?? ''
    form.dateDay = event.date_iso.slice(0, 10)
  }
}

function resetForm() {
  form.id = ''
  form.eventTypeId = props.eventTypes[0]?.id ?? ''
  form.dateDay = ''
  form.dateMonth = ''
  form.dateYear = ''
  form.isUnknown = false
  form.primaryIds = []
  form.additionalIds = []
}
async function handleSave() {
  isSaving.value = true
  try {
    const isoDate = buildIsoDate()
    const payload = [
      props.treeId, form.eventTypeId, isoDate, form.precision,
      form.isUnknown, form.bound, form.primaryIds, form.additionalIds
    ] as const

    if (form.id) {
      await sendUpdateEventRequest(props.treeId, form.id, new UpdateEventRequest(...payload))
    } else {
      await sendCreateEventRequest(props.treeId, new CreateEventRequest(...payload))
    }

    toast.add({ title: t('common.success'), color: 'success' })
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    showApiErrorToast(e)
  } finally {
    isSaving.value = false
  }
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    props.event ? fillFormFromEvent(props.event) : resetForm()
  }
})

function close() {
  isModalVisible.value = false
}
</script>

<template>
  <UModal
    v-model:open="isModalVisible"
    @close="close"
    :title="form.id ? t('tree.events.modal.edit_title') : t('tree.events.modal.create_title')"
    :ui="{ content: 'bg-default' }"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField :label="t('tree.events.modal.type_label')">
          <USelect
            v-model="form.eventTypeId"
            :items="eventTypes.map(t => ({ label: t.name, value: t.id }))"
            value-key="value"
            :ui="treeSelectUi"
          />
        </UFormField>

        <UCheckbox v-model="form.isUnknown" :label="t('tree.events.modal.unknown_date')" />

        <div v-if="!form.isUnknown" class="grid gap-3">
          <UInput v-if="form.precision === 'DAY'" v-model="form.dateDay" type="date" :ui="treeFieldUi" />

          <div v-else class="flex gap-2">
            <UInput
              v-if="form.precision === 'MONTH'"
              v-model="form.dateMonth"
              type="number"
              :placeholder="t('tree.events.modal.placeholders.month')"
              class="w-20"
              :ui="treeFieldUi"
            />
            <UInput
              v-model="form.dateYear"
              type="number"
              :placeholder="t('tree.events.modal.placeholders.year')"
              class="flex-1"
              :ui="treeFieldUi"
            />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <USelect v-model="form.precision" :items="precisionOptions" value-key="value" :ui="treeSelectUi" />
            <USelect v-model="form.bound" :items="boundOptions" value-key="value" :ui="treeSelectUi" />
          </div>
        </div>

        <div class="space-y-4">
          <UFormField :label="t('tree.events.modal.primary_people')" :error="primaryCountError">
            <USelectMenu v-model="form.primaryIds" multiple :items="personOptions" value-key="value" :ui="treeSelectMenuUi" />
          </UFormField>

          <UFormField :label="t('tree.events.modal.additional_people')">
            <USelectMenu v-model="form.additionalIds" multiple :items="additionalOptions" value-key="value" :ui="treeSelectMenuUi" />
          </UFormField>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" color="neutral" @click="close">
          {{ t('common.cancel') }}
        </UButton>
        <UButton :loading="isSaving" :disabled="!!primaryCountError" @click="handleSave">
          {{ form.id ? t('tree.events.modal.submit_save') : t('tree.events.modal.submit_create') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
