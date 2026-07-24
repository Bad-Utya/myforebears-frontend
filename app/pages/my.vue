<script setup lang="ts">
import CreateAccountSuggestion from '~/components/common/suggestions/CreateAccountSuggestion.vue'
import CreatePublicPersonSuggestion from '~/components/common/suggestions/CreatePublicPersonSuggestion.vue'
import CreateTreeSuggestion from '~/components/common/suggestions/CreateTreeSuggestion.vue'
import MyTreesActions from '~/components/my/MyTreesActions.vue'
import MyPublicPersonsActions from '~/components/my/MyPublicPersonsActions.vue'
import SideBar from '~/components/common/sidebar/SideBar.vue'
import PublicPersonCardGrid from '~/components/common/cards/PublicPersonCardGrid.vue'
import TreeCardGrid from '~/components/common/cards/TreeCardGrid.vue'
import sendListTreesRequest from '~/services/familytree/listTrees'
import useUserDataHandler from '~/utils/scripts/storages/get/userDataHandler'
import type DataDTO from '~/services/api/dtos/DataDTO'
import type { ListTreesResponse } from '~/services/familytree/dtos/responses/ListTreesResponse'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import { loadTreeCardItems, revokeTreeCardItems, loadCustomTreeCardItems } from '~/utils/ui/tree/loadTreeCardItems'
import type { TreeCardItem } from '~/utils/ui/tree/mapTreeToTreeCardItem'
import sendListUserPublicPersonsRequest from '~/services/publicPersons/listUserPublicPersons'
import type { ListPublicPersonsResponse } from '~/services/publicPersons/dtos/responses/ListPublicPersonsResponse'
import {
  loadPublicPersonCardItems,
  revokePublicPersonCardItems
} from '~/utils/ui/publicPersons/loadPublicPersonCardItems'
import type { PublicPersonCardItem } from '~/utils/ui/publicPersons/mapPublicPersonToCardItem'
import PublicPersonModal from '~/components/publicPersons/PublicPersonModal.vue'
import sendListCustomTreesRequest from '~/services/customTrees/listCustomTrees'
import type { ListCustomTreesResponse } from '~/services/customTrees/dtos/responses/ListCustomTreesResponse'

// Инициализация i18n
const { t } = useI18n()

const pending = ref(true)
const publicPersonsPending = ref(true)
const items = ref<TreeCardItem[]>([])
const customItems = ref<TreeCardItem[]>([])
const customPending = ref(true)
const publicPersonItems = ref<PublicPersonCardItem[]>([])
const selectedPublicPerson = ref<PublicPersonCardItem | null>(null)
const isPublicPersonModalOpen = ref(false)
const { userData, initialized, ensureLoaded } = useUserDataHandler()
const isGuest = computed(() => initialized.value && !userData.value)

function replaceItems(nextItems: TreeCardItem[]) {
  revokeTreeCardItems(items.value)
  items.value = nextItems
}

function replaceCustomItems(nextItems: TreeCardItem[]) {
  revokeTreeCardItems(customItems.value)
  customItems.value = nextItems
}

function replacePublicPersonItems(nextItems: PublicPersonCardItem[]) {
  revokePublicPersonCardItems(publicPersonItems.value)
  publicPersonItems.value = nextItems
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

async function loadCustomTrees() {
  customPending.value = true
  try {
    const response = await sendListCustomTreesRequest() as DataDTO<ListCustomTreesResponse>
    replaceCustomItems(await loadCustomTreeCardItems(response.data?.trees ?? []))
  } catch (error) {
    showApiErrorToast(error)
    replaceCustomItems([])
  } finally { customPending.value = false }
}

async function loadPublicPersons() {
  if (!userData.value?.id) {
    replacePublicPersonItems([])
    publicPersonsPending.value = false
    return
  }

  publicPersonsPending.value = true

  try {
    const response = await sendListUserPublicPersonsRequest(userData.value.id, 12) as DataDTO<ListPublicPersonsResponse>
    const persons = Array.isArray(response.data?.persons) ? response.data.persons : []
    replacePublicPersonItems(await loadPublicPersonCardItems(persons))
  } catch (error) {
    showApiErrorToast(error)
    replacePublicPersonItems([])
  } finally {
    publicPersonsPending.value = false
  }
}

function openPublicPerson(item: PublicPersonCardItem) {
  selectedPublicPerson.value = item
  isPublicPersonModalOpen.value = true
}

onMounted(async () => {
  await ensureLoaded()

  await Promise.all([
    loadTrees(),
    loadCustomTrees(),
    loadPublicPersons()
  ])
})

watch(
  () => [initialized.value, userData.value?.id] as const,
  async ([isInitialized, userId]) => {
    if (!isInitialized || !userId) {
      return
    }

    if (publicPersonItems.value.length > 0 || publicPersonsPending.value) {
      return
    }

    await loadPublicPersons()
  },
  { immediate: false }
)

onBeforeUnmount(() => {
  revokeTreeCardItems(items.value)
  revokeTreeCardItems(customItems.value)
  revokePublicPersonCardItems(publicPersonItems.value)
})
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar active-tab="trees" />

    <UMain class="w-full p-4 pt-20 lg:p-8 lg:pt-8">
      <UContainer>
        <div class="mb-4">
          <div
            v-if="!isGuest"
            class="flex flex-col gap-2"
          >
            <h1 class="text-2xl font-semibold">
              {{ t('my.title') }}
            </h1>
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
          <div class="space-y-10">
            <section class="space-y-4">
              <div class="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
                <h2 class="text-xl font-semibold">
                  {{ t('my.trees_title') }}
                </h2>

                <MyTreesActions @changed="loadTrees" />
              </div>

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
            </section>

            <section class="space-y-4">
              <div class="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
                <h2 class="text-xl font-semibold">
                  {{ t('my.custom_trees_title') }}
                </h2>
              </div>
              <TreeCardGrid
                :items="customItems"
                :pending="customPending"
                :limit="12"
              >
                <template #fallback>
                  <CreateTreeSuggestion />
                </template>
              </TreeCardGrid>
            </section>

            <section class="space-y-4">
              <div class="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
                <h2 class="text-xl font-semibold">
                  {{ t('my.public_persons.title') }}
                </h2>

                <MyPublicPersonsActions @changed="loadPublicPersons" />
              </div>

              <PublicPersonCardGrid
                :items="publicPersonItems"
                :pending="publicPersonsPending"
                @select="openPublicPerson"
              >
                <template #fallback>
                  <CreatePublicPersonSuggestion @created="loadPublicPersons" />
                </template>
              </PublicPersonCardGrid>
            </section>
          </div>
        </template>
      </UContainer>
    </UMain>

    <PublicPersonModal
      v-model:open="isPublicPersonModalOpen"
      :person="selectedPublicPerson?.person ?? null"
      editable
      @updated="loadPublicPersons"
      @deleted="loadPublicPersons"
    />
  </div>
</template>
