<script setup lang="ts">
import type { PropType } from 'vue'
import TreePersonNode from '../TreePersonNode.vue'
import type { TreeVisualNode } from '~/utils/ui/tree/coordinates/computeNodes'

defineProps({
  nodes: {
    type: Array as PropType<TreeVisualNode[]>,
    required: true
  },
  treeId: {
    type: String,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  },
  highlightedNodeIds: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  getPartnerId: {
    type: Function as PropType<(nodeId: string) => string | undefined>,
    required: true
  },
  getPersonRoleLabel: {
    type: Function as PropType<(nodeId: string) => string>,
    required: true
  },
  getAvailableParentRoles: {
    type: Function as PropType<(nodeId: string) => ('FATHER' | 'MOTHER')[]>,
    required: true
  }
})

defineEmits<{
  updated: [person: TreeVisualNode['person']]
  structureChanged: [deletedPersonId?: string]
}>()
</script>

<template>
  <div>
    <TreePersonNode
      v-for="node in nodes"
      :key="node.id"
      :tree-id="treeId"
      :person="node.person"
      :x="node.x"
      :y="node.y"
      :width="node.width"
      :height="node.height"
      :is-root="node.isRoot"
      :editable="editable"
      :highlighted="highlightedNodeIds.includes(node.id)"
      :partner-id="getPartnerId(node.id)"
      :role-label="getPersonRoleLabel(node.id)"
      :available-parent-roles="getAvailableParentRoles(node.id)"
      @updated="$emit('updated', $event)"
      @structure-changed="$emit('structureChanged', $event)"
    />
  </div>
</template>
