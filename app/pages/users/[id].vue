<script setup lang="ts">
import SideBar from '~/components/common/sidebar/SideBar.vue'
import TreeCardGrid from '~/components/common/cards/TreeCardGrid.vue'
import useUserDataHandler from '~/utils/scripts/storages/get/userDataHandler'
import sendGetUserInfoRequest from '~/services/users/getUserInfo'
import sendGetUserAvatarRequest from '~/services/photos/getUserAvatar'
import sendListPublicUserTreesRequest from '~/services/familytree/listPublicUserTrees'
import sendListTreesRequest from '~/services/familytree/listTrees'
import type DataDTO from '~/services/api/dtos/DataDTO'
import type { GetUserInfoResponse } from '~/services/users/dtos/responses/GetUserInfoResponse'
import type { ListTreesResponse } from '~/services/familytree/dtos/responses/ListTreesResponse'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import { loadTreeCardItems, revokeTreeCardItems, loadCustomTreeCardItems } from '~/utils/ui/tree/loadTreeCardItems'
import type { TreeCardItem } from '~/utils/ui/tree/mapTreeToTreeCardItem'
import UserAvatar from '~/components/images/avatars/UserAvatar.vue'
import sendListUserPublicPersonsRequest from '~/services/publicPersons/listUserPublicPersons'
import type { ListPublicPersonsResponse } from '~/services/publicPersons/dtos/responses/ListPublicPersonsResponse'
import {
  loadPublicPersonCardItems,
  revokePublicPersonCardItems
} from '~/utils/ui/publicPersons/loadPublicPersonCardItems'
import type { PublicPersonCardItem } from '~/utils/ui/publicPersons/mapPublicPersonToCardItem'
import PublicPersonCardGrid from '~/components/common/cards/PublicPersonCardGrid.vue'
import PublicPersonModal from '~/components/publicPersons/PublicPersonModal.vue'
import sendListCustomTreesRequest from '~/services/customTrees/listCustomTrees'
import sendListUserPublicCustomTreesRequest from '~/services/customTrees/listUserPublicCustomTrees'
import type { ListCustomTreesResponse } from '~/services/customTrees/dtos/responses/ListCustomTreesResponse'

// TODO: check if thats ok
const { t, locale } = useI18n()
const route = useRoute()
const { userData, ensureLoaded } = useUserDataHandler()

const userId = computed(() => {
  const routeId = route.params.id
  const normalizedRouteId = Array.isArray(routeId) ? routeId[0] : routeId

  if (!normalizedRouteId) {
    return undefined
  }

  const parsedUserId = Number(normalizedRouteId)
  return Number.isFinite(parsedUserId) ? parsedUserId : undefined
})

const isOwnProfile = computed(() => {
  return typeof userId.value === 'number' && userId.value === userData.value?.id
})

const registeredLabel = computed(() => {
  if (!createdAtUnix.value) {
    return 'Registration date unavailable'
  }

  return new Intl.DateTimeFormat(locale.value, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(createdAtUnix.value * 1000)
})

const profilePending = ref(true)
const treesPending = ref(true)
const personsPending = ref(true)
const nickname = ref(t('profile.nickname_fallback'))
const createdAtUnix = ref<number | undefined>(undefined)
const avatarUrl = ref<string | null>(null)
const treeItems = ref<TreeCardItem[]>([])
const customTreeItems = ref<TreeCardItem[]>([])
const customTreesPending = ref(true)
const publicPersonItems = ref<PublicPersonCardItem[]>([])
const selectedTab = ref<'trees' | 'customTrees' | 'persons'>('trees')
const selectedPublicPerson = ref<PublicPersonCardItem | null>(null)
const isPublicPersonModalOpen = ref(false)

const treesTitle = computed(() => isOwnProfile.value ? t('profile.trees.my_trees') : t('profile.trees.public_trees'))
const personsTitle = computed(() => isOwnProfile.value ? t('profile.persons.my_persons') : t('profile.persons.public_persons'))
const customTreesTitle = computed(() => isOwnProfile.value ? t('profile.custom_trees.my_trees') : t('profile.custom_trees.public_trees'))
function revokeProfileAvatarUrl() {
  if (avatarUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(avatarUrl.value)
  }
}

function replaceTreeItems(nextItems: TreeCardItem[]) {
  revokeTreeCardItems(treeItems.value)
  treeItems.value = nextItems
}

function replaceCustomTreeItems(nextItems: TreeCardItem[]) {
  revokeTreeCardItems(customTreeItems.value)
  customTreeItems.value = nextItems
}

function replacePublicPersonItems(nextItems: PublicPersonCardItem[]) {
  revokePublicPersonCardItems(publicPersonItems.value)
  publicPersonItems.value = nextItems
}

async function loadUserProfile(targetUserId: number) {
  const response = await sendGetUserInfoRequest(targetUserId) as DataDTO<GetUserInfoResponse>
  const user = response.data?.user

  nickname.value = user?.nickname ?? `User ${targetUserId}`
  createdAtUnix.value = user?.created_at_unix

  try {
    const avatarBlob = await sendGetUserAvatarRequest(targetUserId)
    const nextAvatarUrl = URL.createObjectURL(avatarBlob)

    revokeProfileAvatarUrl()
    avatarUrl.value = nextAvatarUrl
  } catch {
    revokeProfileAvatarUrl()
    avatarUrl.value = null
  }
}

async function loadTrees(targetUserId: number) {
  const response = (
    isOwnProfile.value
      ? await sendListTreesRequest()
      : await sendListPublicUserTreesRequest(targetUserId)
  ) as DataDTO<ListTreesResponse>
  const trees = Array.isArray(response.data?.trees) ? response.data.trees : []

  replaceTreeItems(await loadTreeCardItems(trees))
}

async function loadPublicPersons(targetUserId: number) {
  const response = await sendListUserPublicPersonsRequest(targetUserId, 24) as DataDTO<ListPublicPersonsResponse>
  const persons = Array.isArray(response.data?.persons) ? response.data.persons : []

  replacePublicPersonItems(await loadPublicPersonCardItems(persons))
}

async function loadCustomTrees(targetUserId: number) {
  const response = (isOwnProfile.value
    ? await sendListCustomTreesRequest()
    : await sendListUserPublicCustomTreesRequest(targetUserId)) as DataDTO<ListCustomTreesResponse>
  replaceCustomTreeItems(await loadCustomTreeCardItems(response.data?.trees ?? []))
}

function openPublicPerson(item: PublicPersonCardItem) {
  selectedPublicPerson.value = item
  isPublicPersonModalOpen.value = true
}

async function reloadOpenedUserPublicPersons() {
  if (typeof userId.value !== 'number') {
    return
  }

  await loadPublicPersons(userId.value)
}

onMounted(async () => {
  await ensureLoaded()

  if (typeof userId.value !== 'number') {
    profilePending.value = false
    treesPending.value = false
    return
  }

  try {
    await Promise.all([
      (async () => {
        customTreesPending.value = true
        await loadCustomTrees(userId.value as number)
        customTreesPending.value = false
      })(),
      (async () => {
        profilePending.value = true
        await loadUserProfile(userId.value as number)
        profilePending.value = false
      })(),
      (async () => {
        treesPending.value = true
        await loadTrees(userId.value as number)
        treesPending.value = false
      })(),
      (async () => {
        personsPending.value = true
        await loadPublicPersons(userId.value as number)
        personsPending.value = false
      })()
    ])
  } catch (error) {
    showApiErrorToast(error)
    profilePending.value = false
    treesPending.value = false
    customTreesPending.value = false
    personsPending.value = false
  }
})

onBeforeUnmount(() => {
  revokeProfileAvatarUrl()
  revokeTreeCardItems(treeItems.value)
  revokeTreeCardItems(customTreeItems.value)
  revokePublicPersonCardItems(publicPersonItems.value)
})
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar :active-tab="null" />

    <UMain class="w-full p-4 pt-20 lg:p-8 lg:pt-8">
      <UContainer>
        <div class="rounded-t-3xl rounded-b-none bg-elevated p-5 sm:p-8">
          <div
            v-if="profilePending"
            class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <USkeleton class="size-20 rounded-full bg-sidebar-skeleton" />
            <div class="space-y-4">
              <USkeleton class="h-6 w-40 rounded bg-sidebar-skeleton" />
              <USkeleton class="h-4 w-56 rounded bg-sidebar-skeleton" />
            </div>
          </div>

          <div
            v-else
            class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <UserAvatar
              :user="{ nickname: nickname, avatarUrl: avatarUrl! }"
              :size="20"
              class="shrink-0"
            />

            <div class="min-w-0 space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="truncate text-2xl font-semibold leading-none sm:text-3xl">
                  {{ nickname }}
                </h1>
                <UButton
                  v-if="isOwnProfile"
                  icon="i-lucide-settings-2"
                  color="neutral"
                  variant="link"
                  size="md"
                  class="self-center rounded-full"
                  to="/settings"
                />
              </div>
              <p class="text-sm text-toned">
                {{ t('profile.registered_at', { date: registeredLabel }) }}
              </p>
            </div>
          </div>
        </div>

        <div class="mb-0 flex h-12 w-full items-end bg-linear-to-b from-elevated to-transparent px-5 pb-4 sm:px-8">
          <div class="flex items-center gap-5">
            <UButton
              size="lg"
              variant="link"
              :color="selectedTab === 'trees' ? 'primary' : 'neutral'"
              class="px-0 text-lg font-semibold no-underline hover:no-underline"
              @click="selectedTab = 'trees'"
            >
              {{ treesTitle }}
            </UButton>
            <UButton
              size="lg"
              variant="link"
              :color="selectedTab === 'customTrees' ? 'primary' : 'neutral'"
              class="px-0 text-lg font-semibold no-underline hover:no-underline"
              @click="selectedTab = 'customTrees'"
            >
              {{ customTreesTitle }}
            </UButton>
            <UButton
              size="lg"
              variant="link"
              :color="selectedTab === 'persons' ? 'primary' : 'neutral'"
              class="px-0 text-lg font-semibold no-underline hover:no-underline"
              @click="selectedTab = 'persons'"
            >
              {{ personsTitle }}
            </UButton>
          </div>
        </div>
        <div class="w-full px-1 sm:px-4">
          <TreeCardGrid
            v-if="selectedTab === 'trees'"
            :items="treeItems"
            :pending="treesPending"
          >
            <template #fallback>
              <p class="py-12 text-center text-md text-muted">
                {{ t('profile.trees.not_found') }}
              </p>
            </template>
          </TreeCardGrid>

          <PublicPersonCardGrid
            v-else-if="selectedTab === 'persons'"
            :items="publicPersonItems"
            :pending="personsPending"
            @select="openPublicPerson"
          >
            <template #fallback>
              <p class="py-12 text-center text-md text-muted">
                {{ t('profile.persons.not_found') }}
              </p>
            </template>
          </PublicPersonCardGrid>

          <TreeCardGrid
            v-else
            :items="customTreeItems"
            :pending="customTreesPending"
          >
            <template #fallback>
              <p class="py-12 text-center text-md text-muted">
                {{ t('profile.custom_trees.not_found') }}
              </p>
            </template>
          </TreeCardGrid>
        </div>
      </UContainer>
    </UMain>

    <PublicPersonModal
      v-model:open="isPublicPersonModalOpen"
      :person="selectedPublicPerson?.person ?? null"
      :editable="isOwnProfile"
      @updated="reloadOpenedUserPublicPersons"
      @deleted="reloadOpenedUserPublicPersons"
    />
  </div>
</template>

<style scoped>

</style>
