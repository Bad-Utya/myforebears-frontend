<script setup lang="ts">
import type { NodeAction, PartnerChildAction } from '~/composables/trees/useTreeRelationshipActions'

const { t } = useI18n()

defineProps<{
  nodeActions: NodeAction[]
  partnerChildActions: PartnerChildAction[]
}>()

const emit = defineEmits<{
  'open-create-modal': [
    {
      nodeId: string
      action: 'parent' | 'partner' | 'child'
      relatedPersonIds?: string[]
      event: MouseEvent
    }
  ]
  'highlight-nodes': [nodeIds: string[]]
}>()

function openNodeActionModal(
  nodeId: string,
  action: 'parent' | 'partner' | 'child',
  event: MouseEvent
) {
  event.stopPropagation()
  emit('highlight-nodes', [])
  emit('open-create-modal', { nodeId, action, event })
}

function openPartnerChildModal(
  nodeId: string,
  relatedPersonIds: string[],
  event: MouseEvent
) {
  event.stopPropagation()
  emit('highlight-nodes', [])
  emit('open-create-modal', {
    nodeId,
    action: 'child',
    relatedPersonIds,
    event
  })
}
</script>

<template>
  <div class="tree-canvas__action-layer absolute inset-0 pointer-events-none">
    <!-- Node actions -->
    <div
      v-for="action in nodeActions"
      :key="action.id"
      class="tree-canvas__node-action-anchor"
      :class="action.anchorClass"
      :style="{ left: `${action.x}px`, top: `${action.y}px` }"
    >
      <UButton
        size="xs"
        color="neutral"
        variant="soft"
        :icon="action.icon"
        @mouseenter="emit('highlight-nodes', [action.nodeId])"
        @mouseleave="emit('highlight-nodes', [])"
        @focus="emit('highlight-nodes', [action.nodeId])"
        @blur="emit('highlight-nodes', [])"
        @click="openNodeActionModal(action.nodeId, action.action, $event)"
      >
        {{ action.label }}
      </UButton>
    </div>

    <!-- Partner-child actions -->
    <div
      v-for="action in partnerChildActions"
      :key="action.id"
      class="tree-canvas__partner-child-action-anchor"
      :style="{ left: `${action.x}px`, top: `${action.y}px` }"
    >
      <UButton
        size="xs"
        color="neutral"
        variant="soft"
        icon="i-lucide-baby"
        @mouseenter="emit('highlight-nodes', action.relatedPersonIds)"
        @mouseleave="emit('highlight-nodes', [])"
        @focus="emit('highlight-nodes', action.relatedPersonIds)"
        @blur="emit('highlight-nodes', [])"
        @click="openPartnerChildModal(action.nodeId, action.relatedPersonIds, $event)"
      >
        {{ t('tree.actions.child') }}
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.tree-canvas__action-layer {
  pointer-events: none;
}

.tree-canvas__node-action-anchor--top-left {
  transform: translate(0, 10%);
}

.tree-canvas__node-action-anchor--bottom-right {
  transform: translate(-100%, -100%);
}

.tree-canvas__node-action-anchor--bottom-left {
  transform: translate(0, -100%);
}

.tree-canvas__partner-child-action-anchor {
  transform: translate(-50%, -100%);
}

.tree-canvas__node-action-anchor,
.tree-canvas__partner-child-action-anchor {
  position: absolute;
  z-index: 4;
  pointer-events: auto;
}
</style>
