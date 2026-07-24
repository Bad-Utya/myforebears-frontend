<script setup lang="ts">
import type TreeDTO from "~/services/familytree/dtos/inner/TreeDTO";
import type PersonDTO from "~/services/familytree/dtos/inner/PersonDTO";
import TreeExportModal from "~/components/tree/modals/export/TreeExportModal.vue";

const { t } = useI18n()

const props = defineProps<{
  treeId: string
  tree: TreeDTO | null
  persons: PersonDTO[]
  editable: boolean
}>()

const isModalOpen = ref<boolean>(false)
</script>

<template>
  <div class="w-full flex flex-row justify-between items-center">
    <UButton
      color="primary"
      class="ghost"
      @click="isModalOpen = true"
    >
      {{ t('tree.export.open_button') }}
    </UButton>

    <TreeExportModal
      v-model:open="isModalOpen"
      :treeId="treeId"
      :tree="tree"
      :persons="persons"
      :editable="editable"
    />
  </div>
</template>
