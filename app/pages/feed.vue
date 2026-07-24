<script setup lang="ts">
import SideBar from '~/components/common/sidebar/SideBar.vue'
import TreeCardGrid from '~/components/common/cards/TreeCardGrid.vue'
import sendListRandomPublicTreesRequest from '~/services/familytree/listRandomPublicTrees'
import type DataDTO from '~/services/api/dtos/DataDTO'
import type {ListTreesResponse} from '~/services/familytree/dtos/responses/ListTreesResponse'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import {loadTreeCardItems, revokeTreeCardItems} from '~/utils/ui/tree/loadTreeCardItems'
import type {TreeCardItem} from '~/utils/ui/tree/mapTreeToTreeCardItem'
import {useFeedSearchTrees} from "~/composables/feed/useFeedSearchTrees";
import {watch} from "vue";

const {t} = useI18n()

const pending = ref(true)
const items = ref<TreeCardItem[]>([])

const { query, results, loading, cleanup, doSearch } = useFeedSearchTrees();

function replaceItems(nextItems: TreeCardItem[]) {
  revokeTreeCardItems(items.value)
  items.value = nextItems
}

watch(query, (val) => {
  update()
})

const searchTrees = computed(() => results.value as TreeCardItem[])

function update() {
  console.log(123);
  doSearch(query.value);
}

onMounted(async () => {
  pending.value = true

  try {
    const response = await sendListRandomPublicTreesRequest(24) as DataDTO<ListTreesResponse>
    const trees = Array.isArray(response.data?.trees) ? response.data.trees : []
    replaceItems(await loadTreeCardItems(trees))
  } catch (error) {
    showApiErrorToast(error)
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
  <div class="flex min-h-screen">
    <SideBar active-tab="feed"/>

    <UMain class="w-full p-4 lg:p-8">
      <UContainer>
        <div class="mb-4 w-full items-start justify-between flex flex-col lg:flex-row">
          <h1 class="text-2xl font-semibold">
            {{ t('feed.title') }}
          </h1>

          <FeedTreeSearch
            v-model:data="query"
          />
        </div>
        <TreeCardGrid
          :items="results.length ? searchTrees : items"
          :pending="pending || loading"
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
