<script setup lang="ts">
import UserCardCompact from '~/components/common/cards/UserCardCompact.vue'
import type DataDTO from '~/services/api/dtos/DataDTO'
import sendGetUserAvatarRequest from '~/services/photos/getUserAvatar'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import type UserInfoDTO from '~/services/users/dtos/inner/UserInfoDTO'
import type { ListRandomPublicUsersResponse } from '~/services/users/dtos/responses/ListRandomPublicUsersResponse'
import sendListRandomPublicUsersRequest from '~/services/users/listRandomPublicUsers'

const { t } = useI18n()

type InlineUserFeedItem = {
  id: number
  nickname: string
  createdAtUnix?: number
  avatarUrl: string | null
  href: string
}

const props = withDefaults(defineProps<{
  title?: string
  limit?: number
}>(), {
  title: '',
  limit: 10
})

const displayTitle = computed(() => props.title || '')

const pending = ref(true)
const items = ref<InlineUserFeedItem[]>([])

const skeletonItems = computed<InlineUserFeedItem[]>(() => (
  Array.from({ length: props.limit }, () => ({
    id: -1,
    nickname: '',
    avatarUrl: null,
    href: '#'
  }))
))

function revokeUserItems(currentItems: InlineUserFeedItem[]) {
  for (const item of currentItems) {
    if (item.avatarUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(item.avatarUrl)
    }
  }
}

function replaceItems(nextItems: InlineUserFeedItem[]) {
  revokeUserItems(items.value)
  items.value = nextItems
}

async function mapUserToItem(user: UserInfoDTO): Promise<InlineUserFeedItem> {
  const userId = typeof user.id === 'number' ? user.id : -1

  const nickname = user.nickname?.trim() || t('users.feed.nickname_fallback', { id: userId })

  let avatarUrl: string | null = null

  try {
    const avatarBlob = await sendGetUserAvatarRequest(userId)
    avatarUrl = URL.createObjectURL(avatarBlob)
  } catch {
    avatarUrl = null
  }

  return {
    id: userId,
    nickname,
    createdAtUnix: user.created_at_unix,
    avatarUrl,
    href: `/users/${userId}`
  }
}

onMounted(async () => {
  pending.value = true
  try {
    const response = await sendListRandomPublicUsersRequest(props.limit) as DataDTO<ListRandomPublicUsersResponse>
    const users = Array.isArray(response.data?.users) ? response.data.users : []
    replaceItems(await Promise.all(users.map((user) => mapUserToItem(user))))
  } catch (error) {
    showApiErrorToast(error)
    replaceItems([])
  } finally {
    pending.value = false
  }
})

onBeforeUnmount(() => {
  revokeUserItems(items.value)
})
</script>

<template>
  <section class="py-4">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-left text-md font-semibold text-neutral">
        {{ displayTitle }}
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
        <UserCardCompact
          :pending="pending"
          :user-id="item.id > 0 ? item.id : undefined"
          :nickname="item.nickname"
          :created-at-unix="item.createdAtUnix"
          :avatar-url="item.avatarUrl"
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
