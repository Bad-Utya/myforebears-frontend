<script setup lang="ts">
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import { getTreePersonId } from '~/utils/ui/tree/resolveTreePersonId'
import { useVisualizations } from "~/composables/trees/visualizations/useVisualizations";

const { t } = useI18n()

const props = defineProps<{
  treeId: string
  persons: PersonDTO[]
  editable: boolean
}>()

const { visualizations, loading, fetchList, downloadVisualisation, deleteVisualisation } = useVisualizations(props.treeId)

onMounted(() => fetchList())

const personNameMap = computed(() => {
  const map = new Map<string, string>()
  props.persons.forEach(p => {
    const id = getTreePersonId(p)
    if (id) {
      const name = [p.first_name, p.last_name].filter(Boolean).join(' ')
      map.set(id, name || t('tree.visualizations.unnamed'))
    }
  })
  return map
})

function formatUnixDate(unix: number) {
  if (!unix) return t('tree.visualizations.pending')
  return new Date(unix * 1000).toLocaleString()
}

function getStatusLabel(status: string) {
  if (status === 'VISUALISATION_STATUS_READY') return t('tree.visualizations.statuses.ready')
  if (status === 'VISUALISATION_STATUS_ERROR') return t('tree.visualizations.statuses.error')
  return t('tree.visualizations.statuses.pending')
}

function getStatusColor(status: string) {
  switch (status) {
    case 'VISUALISATION_STATUS_READY': return 'text-green-500'
    case 'VISUALISATION_STATUS_ERROR': return 'text-red-500'
    default: return 'text-amber-500'
  }
}

function formatType(type: string) {
  const key = type.replace('VISUALISATION_TYPE_', '').toLowerCase()
  return t(`tree.visualizations.types.${key}`)
}
</script>

<template>
  <section class="rounded-xl border border-default p-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-xs font-semibold text-highlighted">
          {{ t('tree.visualizations.title') }}
        </p>
        <p class="mt-1 text-xs text-muted">
          {{ t('tree.visualizations.description') }}
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-refresh-cw"
          :loading="loading"
          @click="fetchList"
        />
      </div>
    </div>

    <div v-if="loading && !visualizations.length" class="mt-4 flex flex-col gap-2">
      <USkeleton class="h-24 rounded-lg" v-for="i in 2" :key="i" />
    </div>

    <div v-else-if="visualizations.length" class="mt-4 flex flex-col gap-2">
      <article
        v-for="vis in visualizations"
        :key="vis.id"
        class="group rounded-lg bg-tree-panel-item-bg px-3 py-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-4">
              <p class="truncate uppercase text-sm font-medium text-highlighted">
                {{ formatType(vis.type) }}
              </p>
              <span :class="['border rounded-sm px-1 text-xs font-bold uppercase', getStatusColor(vis.status)]">
                {{ getStatusLabel(vis.status) }}
              </span>
            </div>

            <p class="mt-1 text-xs text-muted">
              {{ t('tree.visualizations.created_at', { date: formatUnixDate(vis.created_at_unix) }) }}
            </p>

            <div class="mt-2 space-y-0.5">
              <p class="text-xs text-neutral">
                <span class="font-medium uppercase text-muted">
                  {{ t('tree.visualizations.root_person') }}:
                </span>
                {{ personNameMap.get(vis.root_person_id) || t('tree.visualizations.unknown') }}
              </p>
              <p class="text-xs text-neutral">
                <span class="font-medium uppercase text-muted">
                  {{ t('tree.visualizations.persons_count') }}:
                </span>
                {{ t('tree.visualizations.members', { count: vis.included_person_ids?.length || 0 }) }}
              </p>
              <p v-if="vis.size_bytes" class="text-xs text-muted italic">
                {{ (vis.size_bytes / 1024).toFixed(1) }} KB
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
            <UButton
              v-if="vis.status === 'VISUALISATION_STATUS_READY'"
              color="neutral"
              variant="soft"
              icon="i-lucide-download"
              size="xs"
              @click="downloadVisualisation(vis)"
            />
            <UButton
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              size="xs"
              @click="deleteVisualisation(vis)"
            />
          </div>
        </div>

        <p v-if="vis.error_message" class="mt-2 text-[10px] text-red-400">
          {{ t('tree.visualizations.error_label', { message: vis.error_message }) }}
        </p>
      </article>
    </div>

    <div v-else class="mt-4 rounded-lg border border-dashed border-default p-6 text-center">
      <p class="text-sm text-muted">
        {{ t('tree.visualizations.empty_state') }}
      </p>
    </div>
  </section>
</template>
