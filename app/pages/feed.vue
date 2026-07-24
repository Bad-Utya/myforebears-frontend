<script setup lang="ts">
import SideBar from '~/components/common/sidebar/SideBar.vue'
import TreeCardGrid from '~/components/common/cards/TreeCardGrid.vue'
import sendListRandomPublicTreesRequest from '~/services/familytree/listRandomPublicTrees'
import type DataDTO from '~/services/api/dtos/DataDTO'
import type { ListTreesResponse } from '~/services/familytree/dtos/responses/ListTreesResponse'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import { loadTreeCardItems, revokeTreeCardItems, loadCustomTreeCardItems } from '~/utils/ui/tree/loadTreeCardItems'
import type { TreeCardItem } from '~/utils/ui/tree/mapTreeToTreeCardItem'
import { useFeedSearchTrees } from '~/composables/feed/useFeedSearchTrees'
import { watch } from 'vue'
import sendListRandomPublicCustomTreesRequest from '~/services/customTrees/listRandomPublicCustomTrees'
import type { ListCustomTreesResponse } from '~/services/customTrees/dtos/responses/ListCustomTreesResponse'

const { t } = useI18n()

const pending = ref(true)
const items = ref<TreeCardItem[]>([])

const { query, selectedTags, treeKind, results, loading, hasActiveSearch, cleanup, doSearch, clearResults } = useFeedSearchTrees()

function replaceItems(nextItems: TreeCardItem[]) {
  revokeTreeCardItems(items.value)
  items.value = nextItems
}

watch([query, selectedTags], () => {
  update()
}, { deep: true })

watch(treeKind, async () => {
  clearResults()
  await loadDefaultTrees()
  await update()
})

const searchTrees = computed(() => results.value as TreeCardItem[])
const displayedItems = computed(() => hasActiveSearch.value ? searchTrees.value : items.value)

function update() {
  return doSearch(query.value, selectedTags.value, treeKind.value)
}

async function loadDefaultTrees() {
  pending.value = true

  try {
    const response = treeKind.value === 'custom'
      ? await sendListRandomPublicCustomTreesRequest(24) as DataDTO<ListCustomTreesResponse>
      : await sendListRandomPublicTreesRequest(24) as DataDTO<ListTreesResponse>
    const trees = Array.isArray(response.data?.trees) ? response.data.trees : []
    replaceItems(treeKind.value === 'custom'
      ? await loadCustomTreeCardItems(trees as import('~/services/customTrees/dtos/inner/CustomTreeDTO').default[])
      : await loadTreeCardItems(trees as import('~/services/familytree/dtos/inner/TreeDTO').default[]))
  } catch (error) {
    showApiErrorToast(error)
    replaceItems([])
  } finally {
    pending.value = false
  }
}

onMounted(async () => {
  await loadDefaultTrees()
})

onBeforeUnmount(() => {
  cleanup()
  revokeTreeCardItems(items.value)
})
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar active-tab="feed" />

    <UMain class="w-full p-4 pt-20 lg:p-8 lg:pt-8">
      <UContainer>
        <div class="mb-4 flex w-full flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-start">
          <h1 class="text-2xl font-semibold">
            {{ t('feed.title') }}
          </h1>

          <FeedTreeSearch
            v-model:data="query"
            v-model:tags="selectedTags"
            v-model:tree-kind="treeKind"
          />
        </div>
        <TreeCardGrid
          :items="displayedItems"
          :pending="(hasActiveSearch ? false : pending) || loading"
        >
          <template #fallback>
            <p class="py-12 text-center text-md text-muted">
              {{ t('main.empty_states.no_trees_found') }}
            </p>
          </template>
        </TreeCardGrid>
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped>
</style>
