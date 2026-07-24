<script setup lang="ts">
import type RelationshipDTO from '~/services/familytree/dtos/inner/RelationshipDTO'
import type {TreeVisualConnection} from "~/utils/ui/tree/coordinates/computeConnections";
import type {TreeVisualNode} from "~/utils/ui/tree/coordinates/computeNodes";

const props = defineProps({
  visibleConnections: {
    type: Array as PropType<TreeVisualConnection[]>,
    required: true
  },
  nodeMap: {
    type: Object as PropType<Map<string, TreeVisualNode>>,
    required: true
  },
  relationships: {
    type: Array as PropType<RelationshipDTO[]>,
    required: true
  },
  width: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <svg
    class="pointer-events-none h-full w-full overflow-visible"
    :viewBox="`0 0 ${props.width} ${props.height}`"
  >
    <TreeConnection
      v-for="connection in visibleConnections"
      :key="connection.id"
      :from-node="nodeMap.get(connection.fromId)!"
      :to-node="nodeMap.get(connection.toId)!"
      :connection="connection"
      :connections="visibleConnections"
      :relationships="relationships"
      :node-map="nodeMap"
    />
  </svg>
</template>
