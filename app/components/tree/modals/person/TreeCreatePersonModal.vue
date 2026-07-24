<script setup lang="ts">
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import type { ParentRole } from './create/TreeCreateParentModal.vue'
import TreeCreateChildModal from './create/TreeCreateChildModal.vue'
import TreeCreateParentModal from './create/TreeCreateParentModal.vue'
import TreeCreatePartnerModal from './create/TreeCreatePartnerModal.vue'

type CreateActionType = 'child' | 'parent' | 'partner' | null

const props = defineProps<{
  open: boolean
  treeId: string
  person: PersonDTO
  partnerId?: string
  availableParentRoles?: ParentRole[]
  action: CreateActionType
  relatedPersonIds?: string[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'created': []
}>()

const modalOpen = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})
</script>

<template>
  <TreeCreateChildModal
    v-if="props.action === 'child'"
    v-model:open="modalOpen"
    :tree-id="props.treeId"
    :person="props.person"
    :partner-id="props.partnerId"
    :related-person-ids="props.relatedPersonIds"
    @created="emit('created')"
  />

  <TreeCreateParentModal
    v-else-if="props.action === 'parent'"
    v-model:open="modalOpen"
    :tree-id="props.treeId"
    :person="props.person"
    :available-parent-roles="props.availableParentRoles"
    @created="emit('created')"
  />

  <TreeCreatePartnerModal
    v-else-if="props.action === 'partner'"
    v-model:open="modalOpen"
    :tree-id="props.treeId"
    :person="props.person"
    @created="emit('created')"
  />
</template>
