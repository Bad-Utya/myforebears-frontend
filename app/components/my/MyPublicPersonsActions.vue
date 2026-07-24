<script setup lang="ts">
import NewPublicPersonModal from '~/components/publicPersons/NewPublicPersonModal.vue'

const { t } = useI18n()

const emit = defineEmits<{
  changed: []
}>()

const isModalOpen = ref(false)
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
      size="lg"
      color="primary"
      variant="solid"
      icon="i-lucide-plus"
      @click="isModalOpen = true"
    >
      {{ t('my.public_persons.actions.new_person') }}
    </UButton>

    <NewPublicPersonModal
      v-model:open="isModalOpen"
      @created="emit('changed')"
    />
  </div>
</template>
