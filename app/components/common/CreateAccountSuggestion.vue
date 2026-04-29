<script setup lang="ts">
withDefaults(defineProps<{
  title?: string;
  description?: string;
  buttonLabel?: string;
  compact?: boolean;
}>(), {
  title: 'Create an account',
  description: 'Save your trees, sync your profile, and continue building your family history.',
  buttonLabel: 'Create account',
  compact: false,
});
</script>

<template>
  <div
    class="rounded-4xl border border-dashed border-default bg-elevated/40"
    :class="compact ? 'p-5' : 'p-8 text-center'"
  >
    <div class="mx-auto space-y-4" :class="compact ? 'max-w-none' : 'max-w-md'">
      <div class="mx-auto flex size-14 items-center justify-center rounded-full bg-muted" v-if="!compact">
        <UIcon name="i-lucide-user-round-plus" class="size-7 text-muted" />
      </div>

      <div class="space-y-2" :class="compact ? 'text-left' : ''" v-if="!compact">
        <h2 class="text-xl font-semibold">{{ title }}</h2>
        <p class="text-sm text-muted">
          {{ description }}
        </p>
      </div>

      <div class="flex gap-3" :class="compact ? 'mx-auto flex-row' : 'justify-center'">
        <UButton color="primary" variant="soft" icon="i-lucide-user-round-plus" to="/auth/register">
          {{ buttonLabel }}
        </UButton>
        <UButton color="neutral" variant="ghost" to="/auth/login">
          Log in
        </UButton>
      </div>
    </div>
  </div>
</template>
