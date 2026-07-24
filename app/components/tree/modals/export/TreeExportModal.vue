<script setup lang="ts">
import { useTreeExport } from "~/composables/trees/export/useExportTree";
import type PersonDTO from "~/services/familytree/dtos/inner/PersonDTO";

const { t } = useI18n()

const isOpen = defineModel<boolean>('open', { default: false })

interface Props {
  treeId: string
  persons: PersonDTO[]
}

const props = defineProps<Props>()

const {
  pending,
  rootPersonId,
  excludedPersonIds,
  selectedType,
  tabs,
  svgTypes,
  personOptions,
  downloadGedcom,
  exportVisualisation
} = useTreeExport(props.treeId, toRef(props, 'persons'))
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="t('tree.export.modal_title')"
    :description="t('tree.export.modal_description')"
    :ui="{ content: 'bg-default flex flex-col sm:max-w-md' }"
  >
    <template #body>
      <UTabs :items="tabs" class="w-full">
        <template #gedcom>
          <div class="mt-2">
            <div>
              <p class="text-sm text-muted">
                {{ t('tree.export.gedcom.description', { format: 'gedcom' }) }}
                <span class="block text-neutral mt-1">
                  {{ t('tree.export.gedcom.warning') }}
                </span>
              </p>
            </div>

            <div class="flex justify-end gap-2 mt-4">
              <UButton color="neutral" variant="ghost" @click="isOpen = false">
                {{ t('common.cancel') }}
              </UButton>
              <UButton
                :loading="pending"
                icon="i-lucide-download"
                @click="downloadGedcom"
              >
                {{ t('tree.export.gedcom.submit') }}
              </UButton>
            </div>
          </div>
        </template>

        <template #svg>
          <div class="pt-2 flex flex-col gap-4">
            <UFormField
              :label="t('tree.export.svg.type_label')"
              :description="t('tree.export.svg.type_description')"
            >
              <USelectMenu
                v-model="selectedType"
                :items="svgTypes"
                :search-input="false"
                highlight-on-hover
                class="w-full"
                color="neutral"
                variant="subtle"
                size="lg"
                :placeholder="t('tree.export.svg.type_placeholder')"
                :ui="{
                  item: 'cursor-pointer hover:bg-accented transition-colors duration-300 ease-out rounded-md',
                }"
              />
            </UFormField>

            <UFormField
              :label="t('tree.export.svg.root_label')"
              :description="t('tree.export.svg.root_description')"
            >
              <USelectMenu
                v-model="rootPersonId"
                :items="personOptions"
                value-key="value"
                :placeholder="t('tree.export.svg.root_placeholder')"
                searchable
                color="neutral"
                class="w-full"
                variant="subtle"
                size="lg"
              />
            </UFormField>

            <UFormField
              :label="t('tree.export.svg.excluded_label')"
              :description="t('tree.export.svg.excluded_description')"
            >
              <USelectMenu
                v-model="excludedPersonIds"
                :items="personOptions"
                multiple
                value-key="value"
                :placeholder="t('tree.export.svg.excluded_placeholder')"
                searchable
                color="neutral"
                class="w-full"
                variant="subtle"
                size="lg"
              />
            </UFormField>

            <div class="flex justify-end gap-2 mt-4">
              <UButton color="neutral" variant="ghost" @click="isOpen = false">
                {{ t('common.cancel') }}
              </UButton>
              <UButton
                :loading="pending"
                icon="i-lucide-external-link"
                @click="exportVisualisation"
              >
                {{ t('tree.export.svg.submit') }}
              </UButton>
            </div>
          </div>
        </template>
      </UTabs>
    </template>
  </UModal>
</template>
