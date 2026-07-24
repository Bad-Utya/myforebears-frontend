<script setup lang="ts">
import CreateAccountSuggestion from '~/components/common/suggestions/CreateAccountSuggestion.vue'
import CreateTreeSuggestion from '~/components/common/suggestions/CreateTreeSuggestion.vue'
import SideBar from '~/components/common/sidebar/SideBar.vue'
import InlineTreeFeed from '~/components/common/inline/InlineTreeFeed.vue'
import MainUserWelcome from '~/components/main/MainUserWelcome.vue'
import type DataDTO from '~/services/api/dtos/DataDTO'
import sendListTreesRequest from '~/services/familytree/listTrees'
import useUserDataHandler from '~/utils/scripts/storages/get/userDataHandler'
import type { ListTreesResponse } from '~/services/familytree/dtos/responses/ListTreesResponse'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import InlineUserFeed from '~/components/common/inline/InlineUserFeed.vue'
import TreeSearchFast from '~/components/main/TreeSearchFast.vue'

const { t } = useI18n()

const { userData, pending, initialized, ensureLoaded } = useUserDataHandler()
const isGuest = computed(() => initialized.value && !pending.value && !userData.value)
const hasNoTrees = ref(false)

async function loadMyTreesState() {
  try {
    const response = await sendListTreesRequest() as DataDTO<ListTreesResponse>
    const trees = Array.isArray(response.data?.trees) ? response.data.trees : []
    hasNoTrees.value = trees.length === 0
  } catch (error) {
    hasNoTrees.value = false
    showApiErrorToast(error)
  }
}

onMounted(async () => {
  await ensureLoaded()

  if (userData.value) {
    await loadMyTreesState()
  }
})
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar active-tab="main" />

    <UMain class="w-full p-4 lg:p-8">
      <UContainer>
        <div class="flex w-full items-start justify-between flex-col lg:flex-row">
          <MainUserWelcome />

          <TreeSearchFast />
        </div>

        <CreateAccountSuggestion
          v-if="isGuest"
          class="mt-4"
        />

        <InlineTreeFeed
          :title="t('main.feeds.trees_title')"
          :limit="10"
        >
          <template #fallback>
            <p class="py-12 text-center text-md text-muted">
              {{ t('common.no_data') }}
            </p>
          </template>
        </InlineTreeFeed>

        <InlineUserFeed
          :title="t('main.feeds.users_title')"
          :limit="10"
        >
          <template #fallback>
            <p class="py-12 text-center text-md text-muted">
              {{ t('common.no_data') }}
            </p>
          </template>
        </InlineUserFeed>

        <CreateTreeSuggestion
          v-if="!isGuest && hasNoTrees"
          class="mt-6"
        />
      </UContainer>
    </UMain>
  </div>
</template>
