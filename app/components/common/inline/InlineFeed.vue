<script setup lang="ts">
import TreeCardCompact from "~/components/common/TreeCardCompact.vue";
import sendListRandomPublicTreesRequest from "~/composables/scripts/familytree/listRandomPublicTrees";
import type DataDTO from "~/composables/scripts/api/dtos/DataDTO";
import type {ListTreesResponse} from "~/composables/scripts/familytree/dtos/responses/ListTreesResponse";
import showApiErrorToast from "~/composables/scripts/ui/showApiErrorToast";
import mapTreeToTreeCardItem, {type TreeCardItem} from "~/composables/scripts/ui/mapTreeToTreeCardItem";

const props = withDefaults(defineProps<{
  title?: string;
  limit?: number;
}>(), {
  title: 'For you',
  limit: 10,
});

const pending = ref(true);
const items = ref<TreeCardItem[]>([]);
const skeletonItems = computed<TreeCardItem[]>(() => (
  Array.from({length: props.limit}, (_, index) => ({
    id: `skeleton-${index}`,
    title: '',
    avatar: '',
    href: '#',
  }))
));

onMounted(async () => {
  pending.value = true;
  try {
    const response = await sendListRandomPublicTreesRequest(props.limit) as DataDTO<ListTreesResponse>;
    const trees = Array.isArray(response.data?.trees) ? response.data.trees : [];
    items.value = trees.map(mapTreeToTreeCardItem);
  } catch (err) {
    showApiErrorToast(err);
    items.value = [];
  } finally {
    pending.value = false;
  }
});

</script>

<template>
  <section class="py-4">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-left text-sm font-semibold text-neutral">{{ props.title }}</h1>
    </div>

    <UCarousel
      :items="pending ? skeletonItems : items"
      arrows
      :loop="false"
      :ui="{
        viewport: 'overflow-hidden',
        container: 'gap-3',
        item: 'basis-[360px] shrink-0'
      }"
      :prev="{ variant: 'ghost', color: 'neutral', class: 'rounded-full bg-neutral/60 backdrop-blur border border-default disabled:hidden' }"
      :next="{ variant: 'ghost', color: 'neutral', class: 'rounded-full bg-neutral/60 backdrop-blur border border-default disabled:hidden' }"
    >
      <template #default="{ item }">
        <TreeCardCompact
          :pending="pending"
          :title="item.title"
          :author="item.author"
          :description="item.description"
          :avatar="item.avatar"
          :cover-seed="item.coverSeed"
          :comments="item.comments"
          :href="item.href"
        />
      </template>
    </UCarousel>
  </section>
</template>

<style scoped>

</style>
