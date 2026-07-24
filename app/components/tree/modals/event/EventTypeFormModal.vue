<script setup lang="ts">
import { treeFieldUi, treeSelectUi } from '~/utils/ui/theme/treeTheme'
import sendCreateEventTypeRequest from '~/services/eventTypes/createEventType'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits(['update:open', 'saved'])

const toast = useToast()
const isSaving = ref(false)

const isModalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const form = reactive({
  name: '',
  primaryPersonsCount: 1,
  primaryPersonsMode: 'PRIMARY_PERSONS_MODE_EXACT'
})

const primaryModeOptions = computed(() => [
  { value: 'PRIMARY_PERSONS_MODE_EXACT', label: t('tree.events.type_modal.rules.exact') },
  { value: 'PRIMARY_PERSONS_MODE_AT_LEAST', label: t('tree.events.type_modal.rules.at_least') }
])

function resetForm() {
  form.name = ''
  form.primaryPersonsCount = 1
  form.primaryPersonsMode = 'PRIMARY_PERSONS_MODE_EXACT'
}

async function handleCreate() {
  if (!form.name.trim()) return

  isSaving.value = true
  try {
    await sendCreateEventTypeRequest(
      form.name.trim(),
      Math.max(0, Number(form.primaryPersonsCount) || 0),
      form.primaryPersonsMode
    )

    toast.add({
      title: t('tree.events.type_modal.success_notification'),
      color: 'success'
    })

    emit('saved')
    emit('update:open', false)
    resetForm()
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    isSaving.value = false
  }
}

watch(() => props.open, (val) => {
  if (!val) resetForm()
})

function close() {
  isModalVisible.value = false
}
</script>

<template>
  <UModal
    v-model:open="isModalVisible"
    @close="close"
    :title="t('tree.events.type_modal.title')"
    :description="t('tree.events.type_modal.description')"
    :ui="{ content: 'bg-default flex flex-col focus:outline-none' }"
  >
    <template #body>
      <div class="mx-auto flex w-full max-w-xl flex-col gap-4">
        <UFormField :label="t('tree.events.type_modal.name_label')">
          <UInput
            v-model="form.name"
            color="neutral"
            variant="subtle"
            :placeholder="t('tree.events.type_modal.name_placeholder')"
            :ui="treeFieldUi"
            autofocus
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField :label="t('tree.events.type_modal.count_label')">
            <UInput
              v-model="form.primaryPersonsCount"
              type="number"
              min="0"
              color="neutral"
              variant="subtle"
              :ui="treeFieldUi"
            />
          </UFormField>

          <UFormField :label="t('tree.events.type_modal.rule_label')">
            <USelect
              v-model="form.primaryPersonsMode"
              :items="primaryModeOptions"
              value-key="value"
              color="neutral"
              variant="subtle"
              :ui="treeSelectUi"
            />
          </UFormField>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          @click="emit('update:open', false)"
        >
          {{ t('common.cancel') }}
        </UButton>
        <UButton
          color="primary"
          variant="soft"
          :loading="isSaving"
          :disabled="!form.name.trim()"
          @click="handleCreate"
        >
          {{ t('tree.events.type_modal.submit_button') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
