<script setup lang="ts">
import SideBar from "~/components/common/SideBar.vue";
import TreeCardGrid from "~/components/common/TreeCardGrid.vue";
import sendListRandomPublicTreesRequest from "~/composables/scripts/familytree/listRandomPublicTrees";
import type DataDTO from "~/composables/scripts/api/dtos/DataDTO";
import type {ListTreesResponse} from "~/composables/scripts/familytree/dtos/responses/ListTreesResponse";
import showApiErrorToast from "~/composables/scripts/ui/showApiErrorToast";
import {loadTreeCardItems, revokeTreeCardItems} from "~/composables/scripts/ui/loadTreeCardItems";
import type {TreeCardItem} from "~/composables/scripts/ui/mapTreeToTreeCardItem";

const pending = ref(true);
const items = ref<TreeCardItem[]>([]);

function replaceItems(nextItems: TreeCardItem[]) {
  revokeTreeCardItems(items.value);
  items.value = nextItems;
}

onMounted(async () => {
  pending.value = true;

  try {
    const response = await sendListRandomPublicTreesRequest(10) as DataDTO<ListTreesResponse>;
    const trees = Array.isArray(response.data?.trees) ? response.data.trees : [];
    replaceItems(await loadTreeCardItems(trees));
  } catch (error) {
    showApiErrorToast(error);
    replaceItems([]);
  } finally {
    pending.value = false;
  }
});

onBeforeUnmount(() => {
  revokeTreeCardItems(items.value);
});
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar activeTab="feed"/>

    <UMain class="w-full p-4 lg:p-6">
      <UContainer>
        <div class="mb-5">
          <h1 class="text-2xl font-semibold">
            Feed
          </h1>
        </div>
        <TreeCardGrid title="" :items="items" :pending="pending" :limit="10">
          <template #fallback>
            <p class="py-12 text-center text-sm text-muted">
              Trees matching the selected parameters were not found.
            </p>
          </template>
        </TreeCardGrid>
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped>

</style>
