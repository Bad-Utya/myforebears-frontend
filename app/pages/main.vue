<script setup lang="ts">
import CreateAccountSuggestion from '~/components/common/suggestions/CreateAccountSuggestion.vue'
import CreateTreeSuggestion from '~/components/common/suggestions/CreateTreeSuggestion.vue'
import SideBar from '~/components/common/sidebar/SideBar.vue'
import InlineTreeFeed from '~/components/common/inline/InlineTreeFeed.vue'
import MainUserWelcome from '~/components/main/MainUserWelcome.vue'
import sendListTreesRequest from '~/services/familytree/listTrees'
import useUserDataHandler from '~/utils/scripts/storages/get/userDataHandler'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import InlineUserFeed from '~/components/common/inline/InlineUserFeed.vue'
import TreeSearchFast from '~/components/main/TreeSearchFast.vue'
import InlinePublicPersonFeed from '~/components/common/inline/InlinePublicPersonFeed.vue'
import sendListCustomTreesRequest from '~/services/customTrees/listCustomTrees'

const { t } = useI18n()

const { userData, pending, initialized, ensureLoaded } = useUserDataHandler()
const isGuest = computed(() => initialized.value && !pending.value && !userData.value)
const hasNoTrees = ref(false)

async function loadMyTreesState() {
  try {
    const [familyResponse, customResponse] = await Promise.all([
      sendListTreesRequest(), sendListCustomTreesRequest()
    ])
    const familyTrees = Array.isArray(familyResponse.data?.trees) ? familyResponse.data.trees : []
    const customTrees = Array.isArray(customResponse.data?.trees) ? customResponse.data.trees : []
    hasNoTrees.value = familyTrees.length === 0 && customTrees.length === 0
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

    <UMain class="w-full p-4 pt-20 lg:p-8 lg:pt-8">
      <UContainer>
        <div class="flex w-full flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-start">
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

        <InlineTreeFeed
          :title="t('main.feeds.custom_trees_title')"
          :limit="10"
          tree-kind="custom"
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

        <InlinePublicPersonFeed
          :title="t('main.feeds.public_persons_title')"
          :limit="10"
        >
          <template #fallback>
            <p class="py-12 text-center text-md text-muted">
              {{ t('common.no_data') }}
            </p>
          </template>
        </InlinePublicPersonFeed>

        <CreateTreeSuggestion
          v-if="!isGuest && hasNoTrees"
          class="mt-6"
        />
      </UContainer>
    </UMain>
  </div>
</template>
