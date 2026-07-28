<script setup lang="ts">
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import { useTreePersonsFilters } from '~/composables/trees/sidebar/useTreePersonsFilters'
import TreeSidebarPersonItem from '~/components/tree/sidebar/persons/TreeSidebarPersonItem.vue'
import { getTreePersonId } from '~/utils/ui/tree/resolveTreePersonId'

const { t } = useI18n()

const props = defineProps<{
  treeId: string
  persons: PersonDTO[]
  editable: boolean
}>()

const emit = defineEmits<{
  updated: [person: PersonDTO]
  structureChanged: [deletedPersonId?: string]
}>()

const filtersPopoverOpen = ref(false)

const {
  query,
  genderFilter,
  ageFrom,
  ageTo,
  yearFrom,
  yearTo,
  filteredPersons,
  resetFilters
} = useTreePersonsFilters(computed(() => props.persons))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-start gap-2">
      <UInput
        v-model="query"
        class="flex-1"
        icon="i-lucide-search"
        color="primary"
        variant="subtle"
        :placeholder="t('tree.persons.search_placeholder')"
      />

      <UPopover
        v-model:open="filtersPopoverOpen"
        :popper="{ placement: 'bottom-end' }"
      >
        <UButton
          color="neutral"
          variant="subtle"
          icon="i-lucide-sliders-horizontal"
        />

        <template #content>
          <div class="w-80 space-y-4 p-4">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-highlighted">
                {{ t('tree.persons.filters.title') }}
              </p>
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                @click="resetFilters"
              >
                {{ t('tree.persons.filters.reset') }}
              </UButton>
            </div>

            <div class="space-y-2">
              <p class="text-xs font-semibold uppercase tracking-wider text-muted">
                {{ t('tree.persons.filters.gender') }}
              </p>
              <USelectMenu
                v-model="genderFilter"
                class="w-full"
                value-key="value"
                :search-input="false"
                :items="[
                  { label: t('tree.persons.filters.both'), value: 'BOTH' },
                  { label: t('tree.persons.filters.male'), value: 'MALE' },
                  { label: t('tree.persons.filters.female'), value: 'FEMALE' }
                ]"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <UInput
                v-model="ageFrom"
                type="number"
                :placeholder="t('tree.persons.filters.age_from')"
              />
              <UInput
                v-model="ageTo"
                type="number"
                :placeholder="t('tree.persons.filters.age_to')"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <UInput
                v-model="yearFrom"
                type="number"
                :placeholder="t('tree.persons.filters.year_from')"
              />
              <UInput
                v-model="yearTo"
                type="number"
                :placeholder="t('tree.persons.filters.year_to')"
              />
            </div>
          </div>
        </template>
      </UPopover>
    </div>

    <div
      v-if="filteredPersons.length"
      class="space-y-3"
    >
      <TreeSidebarPersonItem
        v-for="person in filteredPersons"
        :key="getTreePersonId(person)"
        :tree-id="props.treeId"
        :person="person"
        :editable="props.editable"
        @updated="emit('updated', $event)"
        @structure-changed="emit('structureChanged', $event)"
      />
    </div>

    <p
      v-else
      class="py-8 text-center text-sm text-muted"
    >
      {{ t('tree.persons.no_results') }}
    </p>
  </div>
</template>
