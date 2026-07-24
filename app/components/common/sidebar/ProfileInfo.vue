<script setup lang="ts">
import sendLogoutAllRequest from '~/services/auth/logoutAll'
import sendLogoutRequest from '~/services/auth/logout'
import { clearAuthTokens } from '~/utils/scripts/cookies/getAccessToken'
import useUserDataHandler from '~/utils/scripts/storages/get/userDataHandler'
import { useUserDataStore } from '~/utils/scripts/storages/create/userData'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import UserAvatar from '~/components/images/avatars/UserAvatar.vue'

const { t } = useI18n()

const { userData, pending, initialized, ensureLoaded } = useUserDataHandler()
const userDataStore = useUserDataStore()

const displayName = computed(() => userData.value?.nickname?.trim() || userData.value?.email?.trim())
const emailLabel = computed(() => userData.value?.email?.trim())
const isLoading = computed(() => pending.value || !initialized.value)
const isGuest = computed(() => initialized.value && !userData.value)
const isLogoutModalOpen = ref(false)
const shouldLogoutAll = ref(false)
const isLogoutPending = ref(false)

const dropdownItems = computed(() => [[
  {
    label: t('common.profile_menu.my_profile'),
    icon: 'i-lucide-user-round',
    disabled: typeof userData.value?.id !== 'number',
    class: 'rounded-xl',
    onSelect: async () => {
      if (typeof userData.value?.id !== 'number') return
      await navigateTo(`/users/${userData.value.id}`)
    }
  },
  {
    label: t('common.profile_menu.settings'),
    icon: 'i-lucide-settings-2',
    color: 'neutral',
    class: 'rounded-xl',
    onSelect: async () => {
      await navigateTo('/settings')
    }
  }
], [
  {
    label: t('common.profile_menu.logout'),
    icon: 'i-lucide-log-out',
    color: 'error',
    class: 'rounded-xl text-error',
    ui: {
      itemLeadingIcon: 'text-error'
    },
    onSelect: () => {
      isLogoutModalOpen.value = true
    }
  }
]])

async function confirmLogout() {
  if (isLogoutPending.value) return
  isLogoutPending.value = true

  try {
    if (shouldLogoutAll.value) {
      await sendLogoutAllRequest()
    } else {
      await sendLogoutRequest()
    }

    clearAuthTokens()
    userDataStore.clearUserData()
    isLogoutModalOpen.value = false
    shouldLogoutAll.value = false

    await navigateTo('/auth/login')
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    isLogoutPending.value = false
  }
}

onMounted(async () => {
  await ensureLoaded()
})
</script>

<template>
  <div class="w-full">
    <div v-if="isLoading" class="flex items-center gap-4">
      <USkeleton class="size-12 shrink-0 rounded-full bg-sidebar-skeleton" />
      <div class="w-full flex flex-col gap-y-2">
        <USkeleton class="h-4 w-full bg-sidebar-skeleton" />
        <USkeleton class="h-4 w-3/4 bg-sidebar-skeleton" />
      </div>
    </div>

    <CommonSidebarCreateAccountSuggestionInline v-else-if="isGuest" />

    <div v-else class="flex w-full items-center">
      <UDropdownMenu
        :items="dropdownItems"
        :content="{ side: 'top', align: 'start', sideOffset: 12 }"
        size="lg"
        class="w-full"
        :ui="{
          content: 'w-(--reka-dropdown-menu-trigger-width) rounded-2xl border border-sidebar-border bg-sidebar-bg p-2',
          viewport: 'space-y-2 divide-y-0',
          group: 'p-0',
          item: 'items-center rounded-xl p-4 text-sm text-sidebar-text before:rounded-xl cursor-pointer data-highlighted:before:bg-sidebar-hover',
          itemLeadingIcon: 'size-4 text-sidebar-text-muted'
        }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          class="w-full justify-start gap-4 rounded-2xl p-2 text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text"
          :ui="{ base: 'w-full', leadingIcon: 'hidden', trailingIcon: 'hidden' }"
        >
          <UserAvatar :user="userData" :size="12" class="shrink-0" />
          <span class="min-w-0 flex-1 overflow-hidden flex flex-col items-start">
            <span class="text-sm font-semibold text-sidebar-text truncate">
              {{ displayName }}
            </span>
            <span class="text-sm text-sidebar-text-muted truncate">
              {{ emailLabel }}
            </span>
          </span>
          <UIcon name="i-lucide-chevron-up" class="size-4 shrink-0 text-sidebar-text-muted" />
        </UButton>
      </UDropdownMenu>
    </div>

    <UModal
      v-model:open="isLogoutModalOpen"
      :title="t('auth.logout_modal.title')"
      :description="t('auth.logout_modal.description')"
      :ui="{ content: 'bg-default flex max-h-[90dvh] flex-col overflow-y-auto' }"
    >
      <template #body>
        <div class="space-y-4">
          <UCheckbox
            v-model="shouldLogoutAll"
            color="primary"
            :label="t('auth.logout_modal.all_devices_label')"
          />

          <div class="flex flex-wrap items-center justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isLogoutModalOpen = false"
            >
              {{ t('common.cancel') }}
            </UButton>
            <UButton
              color="error"
              :loading="isLogoutPending"
              @click="confirmLogout"
            >
              {{ t('auth.logout_modal.submit') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
