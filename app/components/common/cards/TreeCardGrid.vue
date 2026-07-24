<script setup lang="ts">
import TreeCard from '~/components/common/cards/TreeCard.vue'
import type { TreeCardItem } from '~/utils/ui/tree/mapTreeToTreeCardItem'

const props = withDefaults(defineProps<{
  items?: TreeCardItem[]
  pending?: boolean
  limit?: number
}>(), {
  limit: 12,
  items: () => [],
  pending: false
})

const skeletonItems = computed<TreeCardItem[]>(() => {
  return Array.from({ length: props.limit }, (_, index) => ({
    id: `skeleton-${index}`,
    title: '',
    avatar: '',
    href: '#'
  }))
})

const cardItems = computed(() => (props.pending ? skeletonItems.value : props.items))
const hasItems = computed(() => props.items.length > 0)
</script>

<template>
  <section>
    <div
      v-if="props.pending || hasItems"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    >
      <TreeCard
        v-for="item in cardItems"
        :key="item.id"
        :pending="props.pending"
        :title="item.title"
        :author="item.author"
        :tags-text="item.tagsText"
        :description="item.description"
        :avatar="item.avatar"
        :cover-seed="item.coverSeed"
        :comments="item.comments"
        :href="item.href"
      />
    </div>

    <slot
      v-else
      name="fallback"
    />
  </section>
</template>

<style scoped>

</style>
