<script setup lang="ts">
import type { CustomTreeVisualNode } from '~/utils/ui/customTrees/customTreeLayout'
import CustomEntityModal from '~/components/customTree/CustomEntityModal.vue'
import CustomEntityAvatar from '~/components/customTree/CustomEntityAvatar.vue'

const props = withDefaults(defineProps<{
  treeId: string
  node: CustomTreeVisualNode
  editable: boolean
  hasParent: boolean
  actionsVisible?: boolean
  highlighted?: boolean
}>(), {
  actionsVisible: true,
  highlighted: false
})

const emit = defineEmits<{
  updated: [entity: typeof props.node.entity]
  structureChanged: []
  add: [payload: { nodeId: string, direction: 'parent' | 'child' }]
  highlight: [nodeId: string | null]
}>()
const modalOpen = ref(false)
const style = computed(() => ({
  left: `${props.node.x}px`, top: `${props.node.y}px`,
  width: `${props.node.width}px`, height: `${props.node.height}px`
}))
</script>

<template>
  <article
    data-tree-node="true"
    class="custom-tree-node absolute z-2 select-none"
    :style="style"
  >
    <UButton
      v-if="editable && actionsVisible && !hasParent"
      class="absolute right-0 top-0 z-4 -translate-y-full"
      size="xs"
      color="neutral"
      variant="soft"
      icon="i-lucide-plus"
      @mouseenter="emit('highlight', node.id)"
      @mouseleave="emit('highlight', null)"
      @focus="emit('highlight', node.id)"
      @blur="emit('highlight', null)"
      @click.stop="emit('add', { nodeId: node.id, direction: 'parent' })"
    />
    <div
      class="custom-tree-node__card h-full cursor-pointer rounded-xl border border-custom-tree-node-border bg-custom-tree-node-bg p-3 transition hover:bg-custom-tree-node-bg-hover"
      :class="{ 'custom-tree-node__card--highlighted': highlighted }"
      @click="modalOpen = true"
    >
      <div class="flex h-full items-center gap-2">
        <CustomEntityAvatar
          :tree-id="treeId"
          :entity="node.entity"
          :size="12"
        />
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-highlighted">
            {{ node.entity.name }}
          </p>
          <p
            v-if="node.entity.description"
            class="mt-0.5 line-clamp-2 text-[11px] leading-3.5 text-toned"
            :title="node.entity.description"
          >
            {{ node.entity.description }}
          </p>
        </div>
      </div>
    </div>
    <UButton
      v-if="editable && actionsVisible"
      class="absolute bottom-0 left-0 z-4 translate-y-full"
      size="xs"
      color="neutral"
      variant="soft"
      icon="i-lucide-plus"
      @mouseenter="emit('highlight', node.id)"
      @mouseleave="emit('highlight', null)"
      @focus="emit('highlight', node.id)"
      @blur="emit('highlight', null)"
      @click.stop="emit('add', { nodeId: node.id, direction: 'child' })"
    />
  </article>

  <CustomEntityModal
    v-model:open="modalOpen"
    :tree-id="treeId"
    :entity="node.entity"
    :editable="editable"
    :is-root="node.isRoot"
    @updated="emit('updated', $event)"
    @structure-changed="emit('structureChanged')"
  />
</template>

<style scoped>
.custom-tree-node__card {
  transition:
    background-color 160ms ease,
    box-shadow 160ms ease;
}

.custom-tree-node__card--highlighted {
  box-shadow:
    0 0 12px color-mix(in srgb, var(--ui-primary) 18%, transparent 82%),
    0 0 28px color-mix(in srgb, var(--ui-primary) 9%, transparent 91%);
}
</style>
