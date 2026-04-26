<script setup lang="ts">
import CreateAccountSuggestion from "~/components/common/CreateAccountSuggestion.vue";
import sendLogoutAllRequest from "~/composables/scripts/auth/logoutAll";
import sendLogoutRequest from "~/composables/scripts/auth/logout";
import {clearAuthTokens} from "~/composables/scripts/cookies/getAccessToken";
import useUserDataHandler from "~/composables/scripts/storages/get/userDataHandler";
import {useUserDataStore} from "~/composables/scripts/storages/create/userData";
import createAvatarPlaceholder from "~/composables/scripts/ui/createAvatarPlaceholder";
import showApiErrorToast from "~/composables/scripts/ui/showApiErrorToast";

const {userData, pending, initialized, ensureLoaded} = useUserDataHandler();
const userDataStore = useUserDataStore();
const displayName = computed(() => userData.value?.nickname ?? userData.value?.email ?? 'Unknown user');
const avatarPlaceholder = computed(() => createAvatarPlaceholder(displayName.value, userData.value?.id));
const isLoading = computed(() => pending.value || !initialized.value);
const isGuest = computed(() => initialized.value && !userData.value);
const isLogoutModalOpen = ref(false);
const shouldLogoutAll = ref(false);
const isLogoutPending = ref(false);

const dropdownItems = computed(() => [[
  {
    label: 'My profile',
    icon: 'i-lucide-user-round',
    disabled: typeof userData.value?.id !== 'number',
    onSelect: async () => {
      if (typeof userData.value?.id !== 'number') {
        return;
      }

      await navigateTo(`/users/${userData.value.id}`);
    }
  },
  {
    label: 'Settings',
    icon: 'i-lucide-settings-2',
    onSelect: async () => {
      await navigateTo('/settings');
    }
  }
], [
  {
    label: 'Logout',
    icon: 'i-lucide-log-out',
    color: 'error',
    onSelect: () => {
      isLogoutModalOpen.value = true;
    }
  }
]]);

async function confirmLogout() {
  if (isLogoutPending.value) {
    return;
  }

  isLogoutPending.value = true;

  try {
    if (shouldLogoutAll.value) {
      await sendLogoutAllRequest();
    } else {
      await sendLogoutRequest();
    }

    clearAuthTokens();
    userDataStore.clearUserData();
    isLogoutModalOpen.value = false;
    shouldLogoutAll.value = false;

    await navigateTo('/auth/login');
  } catch (error) {
    showApiErrorToast(error);
  } finally {
    isLogoutPending.value = false;
  }
}

onMounted(async () => {
  await ensureLoaded();
});
</script>

// https://ui.nuxt.com/docs/components/sidebar
<template>
  <div class="w-full">
    <div v-if="isLoading" class="flex items-center gap-4">
      <USkeleton class="size-12 shrink-0 rounded-full"></USkeleton>
      <div class="w-full flex flex-col gap-y-2">
        <USkeleton class="h-4 w-full"></USkeleton>
        <USkeleton class="h-4 w-3/4"></USkeleton>
      </div>
    </div>

    <CreateAccountSuggestion
      v-else-if="isGuest"
      compact
      title="Continue with an account"
      description="Sign up to save your trees, manage your profile, and return to your data later."
      button-label="Sign up"
    />

    <div v-else class="flex items-center gap-4">
      <UDropdownMenu :items="dropdownItems" :content="{ side: 'top', align: 'start' }">
        <UButton
          block
          color="neutral"
          variant="ghost"
          class="justify-start rounded-lg px-2 py-2"
          :ui="{ base: 'w-full', leadingIcon: 'hidden', trailingIcon: 'hidden' }"
        >
          <UAvatar v-if="userData?.avatarUrl" :src="userData.avatarUrl" class="size-12 shrink-0"/>
          <span
            v-else
            :style="avatarPlaceholder.style"
            class="size-12 shrink-0 rounded-full inline-flex items-center justify-center text-sm font-semibold select-none"
          >
            {{ avatarPlaceholder.label }}
          </span>
          <span class="min-w-0 flex flex-col items-start">
            <span class="text-sm font-semibold text-highlighted truncate">
              {{ displayName }}
            </span>
            <span class="text-sm text-muted truncate">
              {{ userData?.email ?? 'example@gmail.com' }}
            </span>
          </span>
        </UButton>
      </UDropdownMenu>
    </div>

    <UModal
      v-model:open="isLogoutModalOpen"
      title="Confirm logout"
      description="Choose how you want to end the session."
    >
      <template #body>
        <div class="space-y-5">
          <UCheckbox
            v-model="shouldLogoutAll"
            label="Logout from all devices"
            description="Also end all other active sessions."
          />

          <div class="flex justify-end gap-3">
            <UButton color="neutral" variant="ghost" @click="isLogoutModalOpen = false">
              Cancel
            </UButton>
            <UButton color="error" :loading="isLogoutPending" @click="confirmLogout">
              Logout
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>

</style>
