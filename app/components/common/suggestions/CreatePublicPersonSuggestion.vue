<script setup lang="ts">
import NewPublicPersonModal from '~/components/publicPersons/NewPublicPersonModal.vue'

const { t } = useI18n()

const emit = defineEmits<{
  created: []
}>()

const isModalOpen = ref(false)
</script>

<template>
  <div class="rounded-4xl border border-dashed border-default bg-elevated/40 p-8 text-center">
    <div class="mx-auto max-w-md space-y-4">
      <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
        <UIcon
          name="i-lucide-user-round-search"
          class="size-8 text-muted"
        />
      </div>

      <div class="space-y-2">
        <h2 class="text-xl font-semibold">
          {{ t('my.public_persons.empty_state.title') }}
        </h2>
        <p class="text-sm text-muted">
          {{ t('my.public_persons.empty_state.description') }}
        </p>
      </div>

      <div class="flex justify-center">
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-plus"
          @click="isModalOpen = true"
        >
          {{ t('my.public_persons.empty_state.create_button') }}
        </UButton>
      </div>
    </div>

    <NewPublicPersonModal
      v-model:open="isModalOpen"
      @created="emit('created')"
    />
  </div>
</template>
