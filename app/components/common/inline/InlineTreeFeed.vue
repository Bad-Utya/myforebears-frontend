<script setup lang="ts">
import TreeCardCompact from '~/components/common/cards/TreeCardCompact.vue'
import sendListRandomPublicTreesRequest from '~/services/familytree/listRandomPublicTrees'
import type DataDTO from '~/services/api/dtos/DataDTO'
import type { ListTreesResponse } from '~/services/familytree/dtos/responses/ListTreesResponse'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import { loadTreeCardItems, revokeTreeCardItems, loadCustomTreeCardItems } from '~/utils/ui/tree/loadTreeCardItems'
import type { TreeCardItem } from '~/utils/ui/tree/mapTreeToTreeCardItem'
import sendListRandomPublicCustomTreesRequest from '~/services/customTrees/listRandomPublicCustomTrees'
import type { ListCustomTreesResponse } from '~/services/customTrees/dtos/responses/ListCustomTreesResponse'

const props = withDefaults(defineProps<{
  title?: string
  limit?: number
  treeKind?: 'family' | 'custom'
}>(), {
  title: '',
  limit: 10,
  treeKind: 'family'
})

const pending = ref(true)
const items = ref<TreeCardItem[]>([])
const skeletonItems = computed<TreeCardItem[]>(() => (
  Array.from({ length: props.limit }, (_, index) => ({
    id: `skeleton-${index}`,
    title: '',
    avatar: '',
    href: '#'
  }))
))

function replaceItems(nextItems: TreeCardItem[]) {
  revokeTreeCardItems(items.value)
  items.value = nextItems
}

onMounted(async () => {
  pending.value = true
  try {
    const response = props.treeKind === 'custom'
      ? await sendListRandomPublicCustomTreesRequest(props.limit) as DataDTO<ListCustomTreesResponse>
      : await sendListRandomPublicTreesRequest(props.limit) as DataDTO<ListTreesResponse>
    const trees = Array.isArray(response.data?.trees) ? response.data.trees : []
    replaceItems(props.treeKind === 'custom'
      ? await loadCustomTreeCardItems(trees as import('~/services/customTrees/dtos/inner/CustomTreeDTO').default[])
      : await loadTreeCardItems(trees as import('~/services/familytree/dtos/inner/TreeDTO').default[]))
  } catch (err) {
    showApiErrorToast(err)
    replaceItems([])
  } finally {
    pending.value = false
  }
})

onBeforeUnmount(() => {
  revokeTreeCardItems(items.value)
})
</script>

<template>
  <section class="py-4">
    <div class="mb-4 flex items-center justify-between gap-3">
      <h1 class="text-left text-md font-semibold text-neutral">
        {{ props.title }}
      </h1>
    </div>

    <UCarousel
      v-if="skeletonItems.length > 0"
      :items="pending ? skeletonItems : items"
      arrows
      :loop="false"
      :ui="{
        viewport: 'overflow-hidden',
        item: 'basis-[84%] shrink-0 sm:basis-sm'
      }"
      :prev="{ variant: 'subtle', color: 'neutral', class: 'rounded-full backdrop-blur disabled:hidden' }"
      :next="{ variant: 'subtle', color: 'neutral', class: 'rounded-full backdrop-blur disabled:hidden' }"
    >
      <template #default="{ item }">
        <TreeCardCompact
          :pending="pending"
          :title="item.title"
          :author="item.author"
          :tags-text="item.tagsText"
          :description="item.description"
          :avatar="item.avatar"
          :cover-seed="item.coverSeed"
          :comments="item.comments"
          :href="item.href"
        />
      </template>
    </UCarousel>
    <slot
      v-else
      name="fallback"
    />
  </section>
</template>

<style scoped>

</style>
