<script setup lang="ts">
import SideBar from "~/components/common/SideBar.vue";
import TreeCardGrid from "~/components/common/TreeCardGrid.vue";
import useUserDataHandler from "~/composables/scripts/storages/get/userDataHandler";
import createAvatarPlaceholder from "~/composables/scripts/ui/createAvatarPlaceholder";
import sendGetUserInfoRequest from "~/composables/scripts/users/getUserInfo";
import sendGetUserAvatarRequest from "~/composables/scripts/photos/getUserAvatar";
import sendListPublicUserTreesRequest from "~/composables/scripts/familytree/listPublicUserTrees";
import sendListTreesRequest from "~/composables/scripts/familytree/listTrees";
import type DataDTO from "~/composables/scripts/api/dtos/DataDTO";
import type {GetUserInfoResponse} from "~/composables/scripts/users/dtos/responses/GetUserInfoResponse";
import type {ListTreesResponse} from "~/composables/scripts/familytree/dtos/responses/ListTreesResponse";
import showApiErrorToast from "~/composables/scripts/ui/showApiErrorToast";
import {loadTreeCardItems, revokeTreeCardItems} from "~/composables/scripts/ui/loadTreeCardItems";
import type {TreeCardItem} from "~/composables/scripts/ui/mapTreeToTreeCardItem";

const route = useRoute();
const {userData, ensureLoaded} = useUserDataHandler();

const userId = computed(() => {
  const routeId = route.params.id;
  const normalizedRouteId = Array.isArray(routeId) ? routeId[0] : routeId;

  if (!normalizedRouteId) {
    return undefined;
  }

  const parsedUserId = Number(normalizedRouteId);
  return Number.isFinite(parsedUserId) ? parsedUserId : undefined;
});

const isOwnProfile = computed(() => {
  return typeof userId.value === 'number' && userId.value === userData.value?.id;
});

const registeredLabel = computed(() => {
  if (!createdAtUnix.value) {
    return 'Registration date unavailable';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(createdAtUnix.value * 1000);
});

const profilePending = ref(true);
const treesPending = ref(true);
const nickname = ref('User');
const createdAtUnix = ref<number | undefined>(undefined);
const avatarUrl = ref<string | null>(null);
const treeItems = ref<TreeCardItem[]>([]);
const avatarPlaceholder = computed(() => createAvatarPlaceholder(nickname.value, userId.value));
const treesTitle = computed(() => isOwnProfile.value ? 'All Trees' : 'Public Trees');

function revokeProfileAvatarUrl() {
  if (avatarUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(avatarUrl.value);
  }
}

function replaceTreeItems(nextItems: TreeCardItem[]) {
  revokeTreeCardItems(treeItems.value);
  treeItems.value = nextItems;
}

async function loadUserProfile(targetUserId: number) {
  const response = await sendGetUserInfoRequest(targetUserId) as DataDTO<GetUserInfoResponse>;
  const user = response.data?.user;

  nickname.value = user?.nickname ?? `User ${targetUserId}`;
  createdAtUnix.value = user?.created_at_unix;

  try {
    const avatarBlob = await sendGetUserAvatarRequest(targetUserId);
    const nextAvatarUrl = URL.createObjectURL(avatarBlob);

    revokeProfileAvatarUrl();
    avatarUrl.value = nextAvatarUrl;
  } catch {
    revokeProfileAvatarUrl();
    avatarUrl.value = null;
  }
}

async function loadTrees(targetUserId: number) {
  const response = (
    isOwnProfile.value
      ? await sendListTreesRequest()
      : await sendListPublicUserTreesRequest(targetUserId)
  ) as DataDTO<ListTreesResponse>;
  const trees = Array.isArray(response.data?.trees) ? response.data.trees : [];

  replaceTreeItems(await loadTreeCardItems(trees));
}

onMounted(async () => {
  await ensureLoaded();

  if (typeof userId.value !== 'number') {
    profilePending.value = false;
    treesPending.value = false;
    return;
  }

  try {
    await Promise.all([
      (async () => {
        profilePending.value = true;
        await loadUserProfile(userId.value as number);
        profilePending.value = false;
      })(),
      (async () => {
        treesPending.value = true;
        await loadTrees(userId.value as number);
        treesPending.value = false;
      })()
    ]);
  } catch (error) {
    showApiErrorToast(error);
    profilePending.value = false;
    treesPending.value = false;
  }
});

onBeforeUnmount(() => {
  revokeProfileAvatarUrl();
  revokeTreeCardItems(treeItems.value);
});
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar :active-tab="null" />

    <UMain class="w-full p-6 lg:p-10">
      <UContainer>
        <div class="rounded-4xl border border-default bg-elevated/60 p-8 mb-6">
          <div v-if="profilePending" class="flex items-center gap-4">
            <USkeleton class="size-20 rounded-full" />
            <div class="space-y-3">
              <USkeleton class="h-5 w-28 rounded" />
              <USkeleton class="h-8 w-56 rounded" />
              <USkeleton class="h-4 w-24 rounded" />
            </div>
          </div>

          <div v-else class="flex items-center gap-4">
            <UAvatar v-if="avatarUrl" :src="avatarUrl" class="size-20 shrink-0" />
            <div
              v-else
              :style="avatarPlaceholder.style"
              class="size-20 shrink-0 rounded-full flex items-center justify-center text-xl font-semibold select-none"
            >
              {{ avatarPlaceholder.label }}
            </div>

            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-3">
                <h1 class="text-3xl font-semibold truncate">
                  {{ nickname }}
                </h1>
                <UButton
                  v-if="isOwnProfile"
                  icon="i-lucide-settings-2"
                  color="neutral"
                  variant="ghost"
                  class="shrink-0 rounded-full"
                  to="/settings"
                />
              </div>
              <p class="text-sm text-toned">
                Registered on {{ registeredLabel }}
              </p>
            </div>
          </div>
        </div>

        <TreeCardGrid :title="treesTitle" :items="treeItems" :pending="treesPending" :limit="12">
          <template #fallback>
            <p class="py-12 text-center text-sm text-muted">
              Public trees were not found.
            </p>
          </template>
        </TreeCardGrid>
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped>

</style>
