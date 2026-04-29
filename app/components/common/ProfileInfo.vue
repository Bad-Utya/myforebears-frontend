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
const displayName = computed(() => userData.value?.nickname?.trim() || userData.value?.email?.trim() || 'Unknown user');
const emailLabel = computed(() => userData.value?.email?.trim() || 'Email unavailable');
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
    class: 'rounded-xl',
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
    class: 'rounded-xl',
    onSelect: async () => {
      await navigateTo('/settings');
    }
  }
], [
  {
    label: 'Logout',
    icon: 'i-lucide-log-out',
    color: 'error',
    class: 'rounded-xl text-error before:bg-transparent data-highlighted:before:bg-transparent data-[state=open]:before:bg-transparent',
    ui: {
      itemLeadingIcon: 'text-error'
    },
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

<template>
  <div class="w-full">
    <div v-if="isLoading" class="flex items-center gap-4">
      <USkeleton class="size-12 shrink-0 rounded-full bg-[var(--sidebar-skeleton)]"></USkeleton>
      <div class="w-full flex flex-col gap-y-2">
        <USkeleton class="h-4 w-full bg-[var(--sidebar-skeleton)]"></USkeleton>
        <USkeleton class="h-4 w-3/4 bg-[var(--sidebar-skeleton)]"></USkeleton>
      </div>
    </div>

    <CreateAccountSuggestion
      v-else-if="isGuest"
      compact
      title="Not logged in"
      button-label="Sign up"
    />

    <div v-else class="flex items-center gap-4">
      <UDropdownMenu
        :items="dropdownItems"
        :content="{ side: 'top', align: 'start', sideOffset: 12 }"
        size="lg"
        :ui="{
          content: 'w-72 -ml-4 rounded-3xl border border-[var(--sidebar-border)] bg-sidebar-bg p-2 shadow-2xl ring-0',
          viewport: 'space-y-2 divide-y-0',
          group: 'p-0',
          separator: 'mx-2 my-2 h-px bg-[var(--sidebar-border)]',
          item: 'min-h-12 items-center rounded-xl px-3 py-3 text-sm text-[var(--sidebar-text)] transition-colors before:rounded-xl before:bg-transparent data-highlighted:before:bg-[var(--sidebar-hover)] data-[state=open]:before:bg-[var(--sidebar-hover)]',
          itemLeadingIcon: 'size-5 text-[var(--sidebar-text-muted)]',
          itemTrailingIcon: 'size-4 text-[var(--sidebar-text-muted)]',
          itemLabel: 'font-medium',
          itemTrailing: 'ml-auto'
        }"
      >
        <UButton
          block
          color="neutral"
          variant="ghost"
          class="gap-3.5 justify-start rounded-2xl px-2 py-2 text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]"
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
          <span class="min-w-0 flex flex-1 flex-col items-start">
            <span class="text-sm font-semibold text-[var(--sidebar-text)] truncate">
              {{ displayName }}
            </span>
            <span class="text-xs text-[var(--sidebar-text-muted)] truncate">
              {{ emailLabel }}
            </span>
          </span>
          <UIcon
            name="i-lucide-chevron-up"
            class="size-4 shrink-0 text-[var(--sidebar-text-muted)]"
          />
        </UButton>
      </UDropdownMenu>
    </div>

    <UModal
      v-model:open="isLogoutModalOpen"
      title="Confirm logout"
      description="Choose if you want to end other sessions"
      :ui="{
        content: 'bg-default flex flex-col focus:outline-none'
      }"
    >
      <template #body>
        <div class="space-y-5">
          <UCheckbox
            v-model="shouldLogoutAll"
            color="primary"
            label="Logout from all devices"
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
