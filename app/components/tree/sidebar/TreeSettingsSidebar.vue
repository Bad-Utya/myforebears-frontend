<script setup lang="ts">
import type TreeDTO from '~/services/familytree/dtos/inner/TreeDTO'

import TreeMainSettings from './settings/TreeMainSettings.vue'
import TreeAccessManager from './settings/TreeAccessManager.vue'
import TreeDangerZone from './settings/TreeDangerZone.vue'
import {useTreeSettings} from "~/composables/trees/sidebar/useTreeSettings";

const props = defineProps<{
  treeId: string
  tree: TreeDTO | null
  editable: boolean
  pending?: boolean
}>()

const emit = defineEmits<{
  treeUpdated: [tree: TreeDTO]
  treeDeleted: []
}>()

const { isSaving, updateTree } = useTreeSettings()

async function handleSaveSettings(payload: any) {
  const updatedTree = await updateTree(props.treeId, payload)

  if (updatedTree) {
    emit('treeUpdated', updatedTree)
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 overflow-y-auto pb-2">
    <div v-if="props.pending" class="flex flex-1 flex-col gap-4">
      <div class="rounded-xl border border-default p-4">
        <USkeleton class="h-5 w-40 rounded" />
        <USkeleton class="mt-3 h-10 rounded-lg" v-for="i in 3" :key="i" />
      </div>
    </div>

    <template v-else>
      <TreeMainSettings
        :tree="props.tree"
        :editable="props.editable"
        :loading="isSaving"
        @save="handleSaveSettings"
      />

      <TreeAccessManager
        :tree-id="props.treeId"
        :editable="props.editable"
      />

      <TreeDangerZone
        :tree-id="props.treeId"
        :tree-name="props.tree?.name ?? props.tree?.title ?? 'this tree'"
        :editable="props.editable"
        @deleted="emit('treeDeleted')"
      />
    </template>
  </div>
</template>
