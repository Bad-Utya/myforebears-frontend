<script setup lang="ts">
import SideBar from "~/components/common/SideBar.vue";
import TreeCardGrid from "~/components/common/TreeCardGrid.vue";
import sendListTreesRequest from "~/composables/scripts/familytree/listTrees";
import type DataDTO from "~/composables/scripts/api/dtos/DataDTO";
import type {ListTreesResponse} from "~/composables/scripts/familytree/dtos/responses/ListTreesResponse";
import showApiErrorToast from "~/composables/scripts/ui/showApiErrorToast";
import mapTreeToTreeCardItem, {type TreeCardItem} from "~/composables/scripts/ui/mapTreeToTreeCardItem";

const pending = ref(true);
const items = ref<TreeCardItem[]>([]);

definePageMeta({ middleware: 'auth' })

onMounted(async () => {
  pending.value = true;

  try {
    const response = await sendListTreesRequest() as DataDTO<ListTreesResponse>;
    const trees = Array.isArray(response.data?.trees) ? response.data.trees : [];
    items.value = trees.map(mapTreeToTreeCardItem);
  } catch (error) {
    showApiErrorToast(error);
    items.value = [];
  } finally {
    pending.value = false;
  }
});
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar activeTab="trees"/>

    <UMain class="w-full p-4 lg:p-6">
      <UContainer class="max-w-[1400px]">
        <div class="mb-4 space-y-1">
          <h1 class="text-2xl font-semibold">My Trees</h1>
          <p class="text-sm text-muted">All your family trees in one grid.</p>
        </div>

        <TreeCardGrid title="All Trees" :items="items" :pending="pending" :limit="12" />
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped>

</style>
