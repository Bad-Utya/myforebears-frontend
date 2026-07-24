<script setup lang="ts">
import useUserDataHandler from '~/utils/scripts/storages/get/userDataHandler'
import UserAvatar from '~/components/images/avatars/UserAvatar.vue'

const { t } = useI18n()

const { userData, pending, initialized, ensureLoaded } = useUserDataHandler()

const displayName = computed(() => userData.value?.nickname ?? userData.value?.email)
const isLoading = computed(() => pending.value || !initialized.value)
const isGuest = computed(() => initialized.value && !userData.value)

onMounted(async () => {
  await ensureLoaded()
})
</script>

<template>
  <div
    v-if="isGuest"
    class="space-y-2"
  >
    <p class="text-left text-sm text-muted">
      {{ t('main.welcome.guest_prefix') }}
    </p>
    <p class="text-left text-xl font-semibold truncate">
      {{ t('main.welcome.guest_name') }}
    </p>
  </div>

  <div
    v-else
    class="space-y-2"
  >
    <p class="text-left text-sm text-muted">
      {{ t('main.welcome.user_prefix') }}
    </p>

    <div
      v-if="isLoading"
      class="flex items-center gap-4"
    >
      <USkeleton class="size-12 rounded-full" />
      <USkeleton class="h-5 w-32 rounded" />
    </div>

    <div
      v-else
      class="flex gap-4 items-center"
    >
      <UserAvatar
        :user="userData"
        :size="12"
        class="shrink-0"
      />

      <p class="text-left text-xl font-semibold truncate">
        {{ displayName }}
      </p>
    </div>
  </div>
</template>

<style scoped>
</style>
