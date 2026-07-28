<script setup lang="ts">
import type { EventParticipant } from '~/utils/ui/events/eventParticipants'

const props = withDefaults(defineProps<{
  label: string
  participants: EventParticipant[]
  excludedIds?: string[]
  error?: string
}>(), {
  excludedIds: () => [],
  error: undefined
})

const selectedIds = defineModel<string[]>({ required: true })
const { t } = useI18n()
const popoverOpen = ref(false)
const selectedPersonId = ref<string>()

const selectedPeople = computed(() => selectedIds.value.map((id) => {
  return props.participants.find(participant => participant.id === id) ?? { id, name: id }
}))

const availableOptions = computed(() => props.participants
  .filter(participant =>
    !selectedIds.value.includes(participant.id)
    && !props.excludedIds.includes(participant.id)
  )
  .map(participant => ({
    label: participant.name,
    value: participant.id
  })))

function addPerson() {
  if (!selectedPersonId.value || selectedIds.value.includes(selectedPersonId.value)) return
  selectedIds.value = [...selectedIds.value, selectedPersonId.value]
  selectedPersonId.value = undefined
}

function removePerson(personId: string) {
  selectedIds.value = selectedIds.value.filter(id => id !== personId)
}

watch(availableOptions, (options) => {
  if (selectedPersonId.value && !options.some(option => option.value === selectedPersonId.value)) {
    selectedPersonId.value = undefined
  }
})
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl border border-default p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm">
          {{ label }}
        </p>
        <p
          v-if="error"
          class="mt-1 text-xs text-error"
        >
          {{ error }}
        </p>
      </div>

      <UPopover
        v-model:open="popoverOpen"
        :popper="{ placement: 'bottom-end' }"
      >
        <UButton
          type="button"
          variant="subtle"
          color="neutral"
          size="sm"
          icon="i-lucide-plus"
          :disabled="availableOptions.length === 0"
        >
          {{ t('tree.events.modal.add_person') }}
        </UButton>

        <template #content>
          <div class="w-72 p-4">
            <div class="space-y-3">
              <USelectMenu
                v-model="selectedPersonId"
                class="w-full"
                :items="availableOptions"
                value-key="value"
                :search-input="{ placeholder: t('tree.events.modal.search_person') }"
                :placeholder="t('tree.events.modal.choose_person')"
              />
              <UButton
                type="button"
                class="w-full justify-center"
                :disabled="!selectedPersonId"
                @click="addPerson"
              >
                {{ t('tree.events.modal.add_person') }}
              </UButton>
            </div>
          </div>
        </template>
      </UPopover>
    </div>

    <div
      v-if="selectedPeople.length"
      class="flex flex-wrap gap-2"
    >
      <button
        v-for="person in selectedPeople"
        :key="person.id"
        type="button"
        class="group flex items-center gap-2 rounded-lg border border-default bg-elevated px-3 py-2 text-left transition-colors hover:border-error/40 hover:bg-error/5"
        @click="removePerson(person.id)"
      >
        <span class="text-sm text-highlighted">
          {{ person.name }}
        </span>
        <UIcon
          name="i-lucide-x"
          class="size-3.5 text-muted transition-colors group-hover:text-error"
        />
      </button>
    </div>

    <p
      v-else
      class="text-sm text-muted"
    >
      {{ t('tree.events.modal.no_people') }}
    </p>
  </div>
</template>
