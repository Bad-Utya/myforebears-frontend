<script setup lang="ts">
import { treeFieldUi, treeSelectMenuUi } from '~/utils/ui/theme/treeTheme'

const { t } = useI18n()

interface Props {
  dateFrom: string
  dateTo: string
  selectedPersonIds: string[]
  personOptions: Array<{ label: string, value: string }>
}

const props = defineProps<Props>()
const emit = defineEmits(['update:dateFrom', 'update:dateTo', 'update:selectedPersonIds'])

const getPersonName = (id: string) =>
  props.personOptions.find(p => p.value === id)?.label || id
</script>

<template>
  <section class="rounded-xl bg-default">
    <div class="flex flex-col gap-4">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div class="flex flex-col gap-1">
          <p class="text-sm text-neutral">
            {{ t('timeline.filters.date_from') }}
          </p>
          <UInput
            :model-value="dateFrom"
            type="date"
            color="neutral"
            variant="subtle"
            :placeholder="t('timeline.filters.date_from')"
            :ui="treeFieldUi"
            @update:model-value="emit('update:dateFrom', $event)"
          />
        </div>

        <div class="flex flex-col gap-1">
          <p class="text-sm text-neutral">
            {{ t('timeline.filters.date_to') }}
          </p>
          <UInput
            :model-value="dateTo"
            type="date"
            color="neutral"
            variant="subtle"
            :placeholder="t('timeline.filters.date_to')"
            :ui="treeFieldUi"
            @update:model-value="emit('update:dateTo', $event)"
          />
        </div>

        <div class="flex flex-col lg:col-span-2 gap-1">
          <p class="text-sm text-neutral">
            {{ t('timeline.filters.included_persons') }}
          </p>
          <USelectMenu
            :model-value="selectedPersonIds"
            multiple
            :items="personOptions"
            value-key="value"
            label-key="label"
            :placeholder="t('timeline.filters.choose_people')"
            color="neutral"
            variant="subtle"
            :ui="treeSelectMenuUi"
            @update:model-value="emit('update:selectedPersonIds', $event)"
          />
        </div>
      </div>

      <div v-if="selectedPersonIds.length" class="flex flex-wrap items-center gap-2">
        <UBadge
          v-for="personId in selectedPersonIds"
          :key="`filter-person-${personId}`"
          color="primary"
          variant="subtle"
          class="rounded-full border border-primary/40 px-3 py-1"
        >
          {{ getPersonName(personId) }}
        </UBadge>
      </div>
    </div>
  </section>
</template>
