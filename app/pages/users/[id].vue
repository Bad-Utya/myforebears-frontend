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
import { loadTreeCardItems, revokeTreeCardItems } from '~/utils/ui/tree/loadTreeCardItems'
import type { TreeCardItem } from '~/utils/ui/tree/mapTreeToTreeCardItem'
import UserAvatar from '~/components/images/avatars/UserAvatar.vue'

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
const nickname = ref(t('profile.nickname_fallback'))
const createdAtUnix = ref<number | undefined>(undefined)
const avatarUrl = ref<string | null>(null)
const treeItems = ref<TreeCardItem[]>([])
const treesTitle = computed(() =>
  isOwnProfile.value ? t('profile.trees.my_trees') : t('profile.trees.public_trees')
)
function revokeProfileAvatarUrl() {
  if (avatarUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(avatarUrl.value)
  }
}

function replaceTreeItems(nextItems: TreeCardItem[]) {
  revokeTreeCardItems(treeItems.value)
  treeItems.value = nextItems
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
        profilePending.value = true
        await loadUserProfile(userId.value as number)
        profilePending.value = false
      })(),
      (async () => {
        treesPending.value = true
        await loadTrees(userId.value as number)
        treesPending.value = false
      })()
    ])
  } catch (error) {
    showApiErrorToast(error)
    profilePending.value = false
    treesPending.value = false
  }
})

onBeforeUnmount(() => {
  revokeProfileAvatarUrl()
  revokeTreeCardItems(treeItems.value)
})
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar :active-tab="null" />

    <UMain class="w-full p-4 lg:p-8">
      <UContainer>
        <div class="rounded-t-4xl rounded-b-none bg-elevated p-8">
          <div
            v-if="profilePending"
            class="flex items-center gap-4"
          >
            <USkeleton class="size-20 rounded-full bg-sidebar-skeleton" />
            <div class="space-y-4">
              <USkeleton class="h-6 w-40 rounded bg-sidebar-skeleton" />
              <USkeleton class="h-4 w-56 rounded bg-sidebar-skeleton" />
            </div>
          </div>

          <div
            v-else
            class="flex items-center gap-4"
          >
            <UserAvatar
              :user="{ nickname: nickname, avatarUrl: avatarUrl! }"
              :size="20"
              class="shrink-0"
            />

            <div class="min-w-0 space-y-2">
              <div class="flex items-center gap-2">
                <h1 class="truncate text-3xl font-semibold leading-none">
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

        <div class="w-full px-8 pb-4 mb-0 h-12 flex items-end bg-linear-to-b from-elevated to-transparent">
          <h1 class="text-left text-lg font-semibold text-neutral">
            {{ treesTitle }}
          </h1>
        </div>
        <div class="w-full px-4">
          <TreeCardGrid
            :items="treeItems"
            :pending="treesPending"
          >
            <template #fallback>
              <p class="py-12 text-center text-md text-muted">
                {{ t('profile.trees.not_found') }}
              </p>
            </template>
          </TreeCardGrid>
        </div>
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped>

</style>
