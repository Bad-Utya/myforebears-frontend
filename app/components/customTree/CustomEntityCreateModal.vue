<script setup lang="ts">
import sendCreateCustomEntityRequest from '~/services/customTrees/createCustomEntity'
import sendAddCustomTreeParentRequest from '~/services/customTrees/addCustomTreeParent'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import { treeFieldUi, treeTextareaUi } from '~/utils/ui/theme/treeTheme'

const props = defineProps<{ treeId: string, relativeId: string, direction: 'parent' | 'child' }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ created: [] }>()
const { t } = useI18n()
const name = ref('')
const description = ref('')
const pending = ref(false)

async function create() {
  if (!name.value.trim()) return
  pending.value = true
  try {
    if (props.direction === 'parent') {
      await sendAddCustomTreeParentRequest(
        props.treeId,
        props.relativeId,
        name.value.trim(),
        description.value.trim() || undefined
      )
    } else {
      await sendCreateCustomEntityRequest(
        props.treeId,
        name.value.trim(),
        description.value.trim() || undefined,
        props.relativeId
      )
    }

    name.value = ''
    description.value = ''
    open.value = false
    emit('created')
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="direction === 'parent' ? t('custom_tree.entity.add_parent') : t('custom_tree.entity.add_child')"
    :description="t('custom_tree.entity.modal_description')"
    :ui="{ content: 'max-h-[90dvh] overflow-y-auto sm:max-w-2xl' }"
  >
    <template #body>
      <form
        class="mx-auto flex w-full max-w-3xl flex-col gap-6"
        @submit.prevent="create"
      >
        <div class="grid grid-cols-1 gap-4">
          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold tracking-wider text-muted uppercase">
              {{ t('custom_tree.entity.name') }}
            </p>
            <UInput
              v-model="name"
              color="neutral"
              variant="subtle"
              class="w-full"
              :ui="treeFieldUi"
              autofocus
            />
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold tracking-wider text-muted uppercase">
              {{ t('custom_tree.entity.description') }}
            </p>
            <UTextarea
              v-model="description"
              color="neutral"
              variant="subtle"
              class="w-full"
              :rows="4"
              :ui="treeTextareaUi"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            @click="open = false"
          >
            {{ t('common.cancel') }}
          </UButton>
          <UButton
            type="submit"
            color="primary"
            :loading="pending"
            :disabled="!name.trim()"
          >
            {{ t('common.create') }}
          </UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>
