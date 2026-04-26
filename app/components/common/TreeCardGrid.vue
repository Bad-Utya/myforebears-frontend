<script setup lang="ts">
import TreeCard from "~/components/common/TreeCard.vue";
import type {TreeCardItem} from "~/composables/scripts/ui/mapTreeToTreeCardItem";

const props = withDefaults(defineProps<{
  items?: TreeCardItem[];
  pending?: boolean;
  title?: string;
  limit?: number;
}>(), {
  title: 'Trees',
  limit: 10,
  items: () => [],
  pending: false,
});

const skeletonItems = computed<TreeCardItem[]>(() => {
  return Array.from({length: props.limit}, (_, index) => ({
    id: `skeleton-${index}`,
    title: '',
    avatar: '',
    href: '#',
  }));
});

const cardItems = computed(() => (props.pending ? skeletonItems.value : props.items));
</script>

<template>
  <section class="py-4">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-left text-sm font-semibold text-neutral">{{ props.title }}</h1>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <TreeCard
        v-for="item in cardItems"
        :key="item.id"
        :pending="props.pending"
        :title="item.title"
        :author="item.author"
        :description="item.description"
        :avatar="item.avatar"
        :cover-seed="item.coverSeed"
        :comments="item.comments"
        :href="item.href"
      />
    </div>
  </section>
</template>

<style scoped>

</style>
