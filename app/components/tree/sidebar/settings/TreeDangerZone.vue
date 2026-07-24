<script setup lang="ts">
import sendDeleteTreeRequest from '~/services/familytree/deleteTree'
import showApiErrorToast from "~/utils/ui/notifications/showApiErrorToast";

const { t } = useI18n()

const props = defineProps<{ treeId: string, treeName: string, editable: boolean }>()
const emit = defineEmits(['deleted'])
const pending = ref(false)

async function onDelete() {
  const confirmed = window.confirm(
    t('tree.danger_zone.confirm_delete', { name: props.treeName })
  )

  if (!confirmed) return

  pending.value = true
  try {
    await sendDeleteTreeRequest(props.treeId)
    emit('deleted')
  } catch (e) {
    showApiErrorToast(e)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section class="rounded-xl border border-red-500/30 p-4">
    <p class="text-sm font-semibold text-red-500">
      {{ t('tree.danger_zone.title') }}
    </p>
    <p class="mt-1 text-xs text-muted">
      {{ t('tree.danger_zone.description') }}
    </p>

    <UButton
      class="mt-4"
      color="error"
      variant="soft"
      :loading="pending"
      :disabled="!editable"
      @click="onDelete"
    >
      {{ t('tree.danger_zone.delete_button') }}
    </UButton>
  </section>
</template>
