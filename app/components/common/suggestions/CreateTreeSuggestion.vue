<script setup lang="ts">
import NewTreeModal from "~/components/my/NewTreeModal.vue";

// Подключаем i18n
const { t } = useI18n()

const isNewTreeModalOpen = ref(false)
</script>

<template>
  <div class="rounded-4xl border border-dashed border-default bg-elevated/40 p-8 text-center">
    <div class="mx-auto max-w-md space-y-4">
      <div class="mx-auto size-16 rounded-full bg-muted flex items-center justify-center">
        <UIcon
          name="i-lucide-network"
          class="size-8 text-muted"
        />
      </div>

      <div class="space-y-2">
        <h2 class="text-xl font-semibold">
          {{ t('my.empty_state.title') }}
        </h2>
        <p class="text-sm text-muted">
          {{ t('my.empty_state.description') }}
        </p>
      </div>

      <div class="flex justify-center">
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-plus"
          @click="isNewTreeModalOpen = true"
        >
          {{ t('my.empty_state.create_button') }}
        </UButton>
      </div>
    </div>

    <NewTreeModal
      v-model:open="isNewTreeModalOpen"
    />
  </div>
</template>
