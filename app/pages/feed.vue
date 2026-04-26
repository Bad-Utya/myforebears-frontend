<script setup lang="ts">
import SideBar from "~/components/common/SideBar.vue";
import TreeCardGrid from "~/components/common/TreeCardGrid.vue";
import sendListRandomPublicTreesRequest from "~/composables/scripts/familytree/listRandomPublicTrees";
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
    const response = await sendListRandomPublicTreesRequest(10) as DataDTO<ListTreesResponse>;
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
    <SideBar activeTab="feed"/>

    <UMain class="w-full p-4 lg:p-6">
      <UContainer>
        <h1>Feed</h1>
        <TreeCardGrid title="" :items="items" :pending="pending" :limit="10" />
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped>

</style>
