<script setup lang="ts">
const { t } = useI18n()

const props = withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: '',
  description: ''
})

const displayTitle = computed(() => props.title || t('suggestions.create_account_default.title'))
const displayDescription = computed(() => props.description || t('suggestions.create_account_default.description'))
</script>

<template>
  <div
    class="rounded-4xl bg-elevated/40 p-8 text-center"
  >
    <div
      class="mx-auto space-y-4 max-w-md"
    >
      <div
        class="mx-auto flex size-16 items-center justify-center rounded-full bg-muted"
      >
        <UIcon
          name="i-lucide-user-round-plus"
          class="size-8 text-muted"
        />
      </div>

      <div
        class="space-y-2"
      >
        <h2 class="text-xl font-semibold">
          {{ displayTitle }}
        </h2>
        <p class="text-sm text-muted">
          {{ displayDescription }}
        </p>
      </div>

      <div
        class="flex gap-4 justify-center"
      >
        <UButton
          color="primary"
          variant="soft"
          icon="i-lucide-user-round-plus"
          to="/auth/register"
        >
          {{ t('auth.actions.sign_up') }}
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          to="/auth/login"
        >
          {{ t('auth.actions.log_in') }}
        </UButton>
      </div>
    </div>
  </div>
</template>
