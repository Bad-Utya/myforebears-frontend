<script setup lang="ts">
import NewTreeModal from "~/components/my/NewTreeModal.vue";

const { t } = useI18n()

const isNewTreeModalOpen = ref(false)

const emit = defineEmits<{
  changed: []
}>()

const openCreateModal = () => {
  isNewTreeModalOpen.value = true
}

const handleTreeCreated = () => {
  emit('changed')
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4 px-1 py-2">
    <div class="flex items-center gap-2">
      <UButton
        size="lg"
        color="primary"
        variant="solid"
        icon="i-lucide-plus"
        @click="openCreateModal"
      >
        {{ t('my.actions.new_tree') }}
      </UButton>
    </div>

    <NewTreeModal
      v-model:open="isNewTreeModalOpen"
      @changed="handleTreeCreated"
    />
  </div>
</template>
