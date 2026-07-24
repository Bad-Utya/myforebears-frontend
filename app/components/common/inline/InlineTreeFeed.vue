<script setup lang="ts">
import TreeCardCompact from '~/components/common/cards/TreeCardCompact.vue'
import sendListRandomPublicTreesRequest from '~/services/familytree/listRandomPublicTrees'
import type DataDTO from '~/services/api/dtos/DataDTO'
import type { ListTreesResponse } from '~/services/familytree/dtos/responses/ListTreesResponse'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import { loadTreeCardItems, revokeTreeCardItems } from '~/utils/ui/tree/loadTreeCardItems'
import type { TreeCardItem } from '~/utils/ui/tree/mapTreeToTreeCardItem'

const props = withDefaults(defineProps<{
  title?: string
  limit?: number
}>(), {
  title: '',
  limit: 10
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
    const response = await sendListRandomPublicTreesRequest(props.limit) as DataDTO<ListTreesResponse>
    const trees = Array.isArray(response.data?.trees) ? response.data.trees : []
    replaceItems(await loadTreeCardItems(trees))
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
    <div class="flex items-center justify-between mb-4">
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
        item: 'basis-sm shrink-0'
      }"
      :prev="{ variant: 'subtle', color: 'neutral', class: 'rounded-full backdrop-blur disabled:hidden' }"
      :next="{ variant: 'subtle', color: 'neutral', class: 'rounded-full backdrop-blur disabled:hidden' }"
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
    <slot
      v-else
      name="fallback"
    />
  </section>
</template>

<style scoped>

</style>
