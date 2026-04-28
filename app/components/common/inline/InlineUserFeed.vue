<script setup lang="ts">
import UserCardCompact from "~/components/common/UserCardCompact.vue";
import type DataDTO from "~/composables/scripts/api/dtos/DataDTO";
import sendGetUserAvatarRequest from "~/composables/scripts/photos/getUserAvatar";
import showApiErrorToast from "~/composables/scripts/ui/showApiErrorToast";
import type UserInfoDTO from "~/composables/scripts/users/dtos/inner/UserInfoDTO";
import type {ListRandomPublicUsersResponse} from "~/composables/scripts/users/dtos/responses/ListRandomPublicUsersResponse";
import sendListRandomPublicUsersRequest from "~/composables/scripts/users/listRandomPublicUsers";

type InlineUserFeedItem = {
  id: number;
  nickname: string;
  createdAtUnix?: number;
  avatarUrl: string | null;
  href: string;
};

const props = withDefaults(defineProps<{
  title?: string;
  limit?: number;
}>(), {
  title: 'People',
  limit: 10,
});

const pending = ref(true);
const items = ref<InlineUserFeedItem[]>([]);
const skeletonItems = computed<InlineUserFeedItem[]>(() => (
  Array.from({length: props.limit}, (_, index) => ({
    id: -(index + 1),
    nickname: '',
    avatarUrl: null,
    href: '#',
  }))
));

function revokeUserItems(currentItems: InlineUserFeedItem[]) {
  for (const item of currentItems) {
    if (item.avatarUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(item.avatarUrl);
    }
  }
}

function replaceItems(nextItems: InlineUserFeedItem[]) {
  revokeUserItems(items.value);
  items.value = nextItems;
}

async function mapUserToItem(user: UserInfoDTO, index: number): Promise<InlineUserFeedItem> {
  const userId = typeof user.id === 'number' ? user.id : index + 1;
  const nickname = user.nickname?.trim() || `User ${userId}`;
  let avatarUrl: string | null = null;

  try {
    const avatarBlob = await sendGetUserAvatarRequest(userId);
    avatarUrl = URL.createObjectURL(avatarBlob);
  } catch {
    avatarUrl = null;
  }

  return {
    id: userId,
    nickname,
    createdAtUnix: user.created_at_unix,
    avatarUrl,
    href: `/users/${userId}`,
  };
}

onMounted(async () => {
  pending.value = true;

  try {
    const response = await sendListRandomPublicUsersRequest(props.limit) as DataDTO<ListRandomPublicUsersResponse>;
    const users = Array.isArray(response.data?.users) ? response.data.users : [];
    replaceItems(await Promise.all(users.map((user, index) => mapUserToItem(user, index))));
  } catch (error) {
    showApiErrorToast(error);
    replaceItems([]);
  } finally {
    pending.value = false;
  }
});

onBeforeUnmount(() => {
  revokeUserItems(items.value);
});
</script>

<template>
  <section class="py-4">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-left text-sm font-semibold text-neutral">{{ props.title }}</h1>
    </div>

    <UCarousel
      :items="pending ? skeletonItems : items"
      arrows
      :loop="false"
      :ui="{
        viewport: 'overflow-hidden',
        container: 'gap-4',
        item: 'basis-[360px] shrink-0'
      }"
      :prev="{ variant: 'ghost', color: 'neutral', class: 'rounded-full bg-neutral/60 backdrop-blur border border-default disabled:hidden' }"
      :next="{ variant: 'ghost', color: 'neutral', class: 'rounded-full bg-neutral/60 backdrop-blur border border-default disabled:hidden' }"
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
  </section>
</template>

<style scoped>

</style>
