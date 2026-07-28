<script setup lang="ts">
import TreeTimelinePage from '~/components/timeline/TreeTimelinePage.vue'

const route = useRoute()
const treeId = computed(() => {
  const id = route.params.id
  return String(Array.isArray(id) ? id[0] : id ?? '')
})
</script>

<template>
  <TreeTimelinePage
    :tree-id="treeId"
    tree-kind="custom"
    :back-href="`/custom-trees/${treeId}/main`"
  />
</template>
