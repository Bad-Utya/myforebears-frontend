<script setup lang="ts">
import type { CSSProperties } from 'vue'

defineProps<{
  sceneStyle: CSSProperties
  isDragging: boolean
  pending?: boolean
}>()

const emit = defineEmits<{
  pointerdown: [event: PointerEvent]
  wheel: [event: WheelEvent]
}>()

const rootRef = ref<HTMLElement | null>(null)

defineExpose({
  rootRef
})
</script>

<template>
  <div
    ref="rootRef"
    class="tree-canvas relative size-full overflow-hidden"
    :class="{ 'tree-canvas--dragging': isDragging }"
    :aria-busy="pending"
    @pointerdown="emit('pointerdown', $event)"
    @wheel.prevent="emit('wheel', $event)"
  >
    <div
      class="tree-canvas__grid absolute inset-0"
      aria-hidden="true"
    />

    <div
      class="tree-canvas__scene absolute left-0 top-0"
      :style="sceneStyle"
    >
      <slot name="scene" />
    </div>

    <slot name="overlay" />
  </div>
</template>

<style scoped>
.tree-canvas {
  --tree-node-bg: color-mix(in srgb, var(--ui-bg) 76%, var(--color-carbon-950) 24%);
  --tree-node-shadow: color-mix(in srgb, black 28%, transparent 72%);
  --tree-root-shadow: color-mix(in srgb, var(--ui-primary) 18%, transparent 82%);
  --tree-node-border-highlight: color-mix(in srgb, white 14%, transparent 86%);
  --tree-avatar-bg: color-mix(in srgb, white 10%, transparent 90%);
  --tree-avatar-text: color-mix(in srgb, white 88%, var(--ui-primary) 12%);
  --tree-badge-bg: color-mix(in srgb, var(--ui-primary) 12%, transparent 88%);
  --tree-badge-border: color-mix(in srgb, var(--ui-primary) 28%, transparent 72%);
  --tree-badge-text: color-mix(in srgb, white 82%, var(--ui-primary) 18%);
  --tree-lineage-color: var(--color-tree-lineage);
  --tree-partner-color: var(--color-tree-partner);

  background: color-mix(in srgb, var(--ui-bg) 90%, black 10%);
  cursor: grab;
}

.tree-canvas--dragging {
  cursor: grabbing;
}

.tree-canvas__grid {
  background:
    linear-gradient(to right, var(--color-tree-grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--color-tree-grid-line) 1px, transparent 1px);

  background-size: 32px 32px;
  opacity: 0.28;
}

.tree-canvas__scene {
  transform-origin: top left;
  will-change: transform;
}
</style>
