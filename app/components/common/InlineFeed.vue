<script setup lang="ts">
import TreeCardCompact from "~/components/common/TreeCardCompact.vue";
import sendListTreesRequest from "~/composables/scripts/familytree/listTrees";
import type DataDTO from "~/composables/scripts/api/dtos/DataDTO";
import type {ListTreesResponse} from "~/composables/scripts/familytree/dtos/responses/ListTreesResponse";
import showApiErrorToast from "~/composables/scripts/ui/showApiErrorToast";

type InlineFeedItem = {
  id: number | string;
  title: string;
  author?: string;
  description?: string;
  avatar: string;
  comments?: string;
  href: string;
}

const pending = ref(true);
const items = ref<InlineFeedItem[]>([]);

const skeletonItems = computed<InlineFeedItem[]>(() => {
  return Array.from({length: 7}, (_, index) => ({
    id: `skeleton-${index}`,
    title: '',
    avatar: '',
    href: '#',
  }));
});

const carouselItems = computed(() => (pending.value ? skeletonItems.value : items.value));

onMounted(async () => {
  pending.value = true;
  try {
    const response = await sendListTreesRequest() as DataDTO<ListTreesResponse>;
    const trees = Array.isArray(response.data?.trees) ? response.data.trees : [];
    if (!trees.length) {
      return;
    }

    items.value = trees.map((tree, index) => {
      const id = tree.id ?? tree.tree_id ?? String(index + 1);

      return {
        id,
        title: String(id),
        avatar: '',
        href: `/trees/${id}`,
      } satisfies InlineFeedItem;
    });
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
    <div class="flex items-center justify-between mb-3">
      <h1 class="text-left text-sm font-semibold text-neutral">For you</h1>
    </div>

    <div>
      <UCarousel
        :items="carouselItems"
        arrows
        :loop="false"
        :ui="{
          viewport: 'overflow-hidden',
          container: 'gap-2',
          item: 'basis-[340px] shrink-0'
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
            :comments="item.comments"
            :href="item.href"
          />
        </template>
      </UCarousel>
    </div>
  </section>
</template>

<style scoped>

</style>
