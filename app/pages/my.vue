<script setup lang="ts">
import CreateAccountSuggestion from '~/components/common/suggestions/CreateAccountSuggestion.vue'
import CreateTreeSuggestion from '~/components/common/suggestions/CreateTreeSuggestion.vue'
import MyTreesActions from '~/components/my/MyTreesActions.vue'
import SideBar from '~/components/common/sidebar/SideBar.vue'
import TreeCardGrid from '~/components/common/cards/TreeCardGrid.vue'
import sendListTreesRequest from '~/services/familytree/listTrees'
import useUserDataHandler from '~/utils/scripts/storages/get/userDataHandler'
import type DataDTO from '~/services/api/dtos/DataDTO'
import type { ListTreesResponse } from '~/services/familytree/dtos/responses/ListTreesResponse'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import { loadTreeCardItems, revokeTreeCardItems } from '~/utils/ui/tree/loadTreeCardItems'
import type { TreeCardItem } from '~/utils/ui/tree/mapTreeToTreeCardItem'

// Инициализация i18n
const { t } = useI18n()

const pending = ref(true)
const items = ref<TreeCardItem[]>([])
const { userData, initialized} = useUserDataHandler()
const isGuest = computed(() => initialized.value && !userData.value)

function replaceItems(nextItems: TreeCardItem[]) {
  revokeTreeCardItems(items.value)
  items.value = nextItems
}

async function loadTrees() {
  pending.value = true

  try {
    const response = await sendListTreesRequest() as DataDTO<ListTreesResponse>
    const trees = Array.isArray(response.data?.trees) ? response.data.trees : []
    replaceItems(await loadTreeCardItems(trees))
  } catch (error) {
    showApiErrorToast(error)
    replaceItems([])
  } finally {
    pending.value = false
  }
}

onMounted(async () => {
  await loadTrees()
})

onBeforeUnmount(() => {
  revokeTreeCardItems(items.value)
})
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar active-tab="trees" />

    <UMain class="w-full p-4 lg:p-8">
      <UContainer>
        <div class="mb-4">
          <div
            v-if="!isGuest"
            class="flex items-center justify-between gap-4"
          >
            <h1 class="text-2xl font-semibold">
              {{ t('my.title') }}
            </h1>

            <MyTreesActions @changed="loadTrees" />
          </div>
          <h1
            v-else
            class="text-2xl font-semibold"
          >
            {{ t('my.title') }}
          </h1>
        </div>

        <CreateAccountSuggestion
          v-if="isGuest"
          class="mt-4"
          :title="t('suggestions.create_account.title')"
          :description="t('suggestions.create_account.description')"
        />

        <template v-else>
          <TreeCardGrid
            title=""
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
