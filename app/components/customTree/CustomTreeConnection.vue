<script setup lang="ts">
import type { CustomTreeVisualNode } from '~/utils/ui/customTrees/customTreeLayout'

const props = defineProps<{ parent: CustomTreeVisualNode, child: CustomTreeVisualNode }>()
const startX = computed(() => props.parent.x + props.parent.width / 2)
const startY = computed(() => props.parent.y + props.parent.height)
const endX = computed(() => props.child.x + props.child.width / 2)
const endY = computed(() => props.child.y)
const middleY = computed(() => (startY.value + endY.value) / 2)
const path = computed(() => `M ${startX.value} ${startY.value} L ${startX.value} ${middleY.value} L ${endX.value} ${middleY.value} L ${endX.value} ${endY.value}`)
</script>

<template>
  <g>
    <path
      :d="path"
      fill="none"
      class="custom-tree-edge"
    />
  </g>
</template>

<style scoped>
.custom-tree-edge { stroke: var(--tree-lineage-color); stroke-width: 2px; vector-effect: non-scaling-stroke; }
</style>
