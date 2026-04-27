<script setup lang="ts">
import CreateAccountSuggestion from '~/components/common/CreateAccountSuggestion.vue'
import CreateTreeSuggestion from '~/components/common/CreateTreeSuggestion.vue'
import MyTreesActions from '~/components/common/MyTreesActions.vue'
import SideBar from '~/components/common/SideBar.vue'
import TreeCardGrid from '~/components/common/TreeCardGrid.vue'
import sendListTreesRequest from '~/composables/scripts/familytree/listTrees'
import useUserDataHandler from '~/composables/scripts/storages/get/userDataHandler'
import type DataDTO from '~/composables/scripts/api/dtos/DataDTO'
import type { ListTreesResponse } from '~/composables/scripts/familytree/dtos/responses/ListTreesResponse'
import showApiErrorToast from '~/composables/scripts/ui/showApiErrorToast'
import mapTreeToTreeCardItem, { type TreeCardItem } from '~/composables/scripts/ui/mapTreeToTreeCardItem'

const pending = ref(true)
const items = ref<TreeCardItem[]>([])
const { userData, initialized, ensureLoaded } = useUserDataHandler()
const isGuest = computed(() => initialized.value && !userData.value)

definePageMeta({ middleware: 'auth' })

async function loadTrees() {
  pending.value = true

  try {
    const response = await sendListTreesRequest() as DataDTO<ListTreesResponse>
    const trees = Array.isArray(response.data?.trees) ? response.data.trees : []
    items.value = trees.map(mapTreeToTreeCardItem)
  } catch (error) {
    showApiErrorToast(error)
    items.value = []
  } finally {
    pending.value = false
  }
}

onMounted(async () => {
  await ensureLoaded()

  if (!userData.value) {
    pending.value = false
    items.value = []
    return
  }

  await loadTrees()
})
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar active-tab="trees" />

    <UMain class="w-full p-4 lg:p-6">
      <UContainer>
        <div class="mb-4 space-y-1">
          <div
            v-if="!isGuest"
            class="flex items-center justify-between gap-3"
          >
            <h1 class="text-2xl font-semibold">
              My Trees
            </h1>
            <MyTreesActions @changed="loadTrees" />
          </div>
          <h1
            v-else
            class="text-2xl font-semibold"
          >
            My Trees
          </h1>
          <p class="text-sm text-muted">
            {{ isGuest ? 'Create an account to keep your trees in one place.' : 'All your family trees in one grid.' }}
          </p>
        </div>

        <CreateAccountSuggestion
          v-if="isGuest"
          title="Create an account to keep your trees"
          description="Guest visitors can browse public pages, but your own trees require an account and saved session."
          button-label="Create account"
        />

        <template v-else>
          <TreeCardGrid
            title="All Trees"
            :items="items"
            :pending="pending"
            :limit="12"
          >
            <template #fallback>
              <CreateTreeSuggestion />
            </template>
          </TreeCardGrid>
        </template>
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped>

</style>
