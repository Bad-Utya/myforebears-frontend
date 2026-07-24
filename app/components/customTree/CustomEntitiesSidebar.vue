<script setup lang="ts">
import type CustomEntityDTO from '~/services/customTrees/dtos/inner/CustomEntityDTO'
import CustomEntityModal from '~/components/customTree/CustomEntityModal.vue'

const props = defineProps<{ treeId: string, entities: CustomEntityDTO[], editable: boolean }>()
const emit = defineEmits<{ updated: [entity: CustomEntityDTO], structureChanged: [] }>()
const query = ref('')
const selected = ref<CustomEntityDTO | null>(null)
const modalOpen = ref(false)
const filtered = computed(() => props.entities.filter(entity => entity.name?.toLowerCase().includes(query.value.trim().toLowerCase())))
function openEntity(entity: CustomEntityDTO) {
  selected.value = entity
  modalOpen.value = true
}
function handleUpdated(entity: CustomEntityDTO) {
  selected.value = entity
  emit('updated', entity)
}
</script>

<template>
  <div class="space-y-3">
    <UInput
      v-model="query"
      icon="i-lucide-search"
      :placeholder="$t('common.search_placeholder')"
      class="w-full"
    />
    <button
      v-for="entity in filtered"
      :key="entity.id"
      class="flex w-full items-center gap-3 rounded-xl border border-default p-3 text-left hover:bg-elevated"
      @click="openEntity(entity)"
    >
      <CustomEntityAvatar
        :tree-id="treeId"
        :entity="entity"
        :size="10"
      />
      <div class="min-w-0">
        <p class="truncate text-sm font-medium">
          {{ entity.name }}
        </p><p class="truncate text-xs text-muted">
          {{ entity.description }}
        </p>
      </div>
    </button>
    <CustomEntityModal
      v-if="selected"
      v-model:open="modalOpen"
      :tree-id="treeId"
      :entity="selected"
      :editable="editable"
      @updated="handleUpdated"
      @structure-changed="emit('structureChanged')"
    />
  </div>
</template>
