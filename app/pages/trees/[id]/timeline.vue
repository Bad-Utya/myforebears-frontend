<script setup lang="ts">
const route = useRoute()
const treeId = computed(() => {
  const id = route.params.id
  return String(Array.isArray(id) ? id[0] : id ?? '')
})
</script>

<template>
  <TreeTimelinePage
    :tree-id="treeId"
    tree-kind="family"
    :back-href="`/trees/${treeId}/main`"
  />
</template>
