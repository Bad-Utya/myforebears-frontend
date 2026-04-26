<script setup lang="ts">
import SideBar from "~/components/common/SideBar.vue";
import sendGetTreeRequest from "~/composables/scripts/familytree/getTree";
import type DataDTO from "~/composables/scripts/api/dtos/DataDTO";
import type {GetTreeResponse} from "~/composables/scripts/familytree/dtos/responses/GetTreeResponse";
import showApiErrorToast from "~/composables/scripts/ui/showApiErrorToast";

const route = useRoute();
const treeId = computed(() => {
  const routeId = route.params.id;
  return Array.isArray(routeId) ? routeId[0] : routeId;
});

const pending = ref(true);
const treeName = ref('Tree');

onMounted(async () => {
  if (!treeId.value) {
    pending.value = false;
    return;
  }

  try {
    const response = await sendGetTreeRequest(treeId.value) as DataDTO<GetTreeResponse>;
    const tree = response.data?.tree;
    treeName.value = tree?.name ?? tree?.title ?? `Tree ${treeId.value}`;
  } catch (error) {
    showApiErrorToast(error);
  } finally {
    pending.value = false;
  }
});
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar :active-tab="null" />

    <UMain class="w-full p-6 lg:p-10">
      <UContainer class="max-w-4xl">
        <div class="rounded-[32px] border border-default bg-elevated/60 p-8 space-y-4">
          <div class="space-y-2">
            <p class="text-sm text-muted">Tree</p>
            <h1 class="text-3xl font-semibold">
              {{ pending ? 'Loading tree...' : treeName }}
            </h1>
          </div>

          <p class="text-sm text-toned">
            Tree ID: {{ treeId }}
          </p>
        </div>
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped>

</style>
