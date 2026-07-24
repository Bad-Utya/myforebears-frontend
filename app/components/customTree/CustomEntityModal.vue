<script setup lang="ts">
import AvatarCropper from '~/components/common/AvatarCropper.vue'
import PersonPhotoGalleryModal from '~/components/common/PersonPhotoGalleryModal.vue'
import CustomEntityAvatar from '~/components/customTree/CustomEntityAvatar.vue'
import type CustomEntityDTO from '~/services/customTrees/dtos/inner/CustomEntityDTO'
import sendUpdateCustomEntityRequest from '~/services/customTrees/updateCustomEntity'
import sendDeleteCustomEntityRequest from '~/services/customTrees/deleteCustomEntity'
import sendUploadCustomEntityAvatarRequest from '~/services/customTrees/uploadCustomEntityAvatar'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import { treeFieldUi, treeTextareaUi } from '~/utils/ui/theme/treeTheme'

type AvatarHandle = { reload: () => Promise<void> }
type CropperHandle = { exportFile: (name?: string, size?: number) => Promise<File> }

const props = defineProps<{
  treeId: string
  entity: CustomEntityDTO
  editable: boolean
  isRoot?: boolean
}>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ updated: [entity: CustomEntityDTO], structureChanged: [] }>()
const { t } = useI18n()
const toast = useToast()

const editMode = ref(false)
const name = ref('')
const description = ref('')
const isSaving = ref(false)
const isDeleting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const cropper = ref<CropperHandle | null>(null)
const avatar = ref<AvatarHandle | null>(null)
const sourceUrl = ref<string | null>(null)
const galleryOpen = ref(false)

function sync() {
  name.value = props.entity.name ?? ''
  description.value = props.entity.description ?? ''
}

function resetAvatarEditor() {
  if (sourceUrl.value?.startsWith('blob:')) URL.revokeObjectURL(sourceUrl.value)
  sourceUrl.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function cancelEdit() {
  editMode.value = false
  sync()
  resetAvatarEditor()
}

function closeModal() {
  galleryOpen.value = false
  open.value = false
  cancelEdit()
}

function selectFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.add({ title: t('custom_tree.entity.image_only'), color: 'error' })
    return
  }
  resetAvatarEditor()
  sourceUrl.value = URL.createObjectURL(file)
}

async function save() {
  if (!props.entity.id || !name.value.trim()) return
  isSaving.value = true
  try {
    const response = await sendUpdateCustomEntityRequest(
      props.treeId,
      props.entity.id,
      name.value.trim(),
      description.value.trim() || undefined
    )
    const updatedEntity: CustomEntityDTO = {
      ...props.entity,
      ...(response.data?.entity ?? {}),
      name: name.value.trim(),
      description: description.value.trim() || undefined
    }

    if (cropper.value) {
      const file = await cropper.value.exportFile('entity-avatar.png', 512)
      await sendUploadCustomEntityAvatarRequest(props.treeId, props.entity.id, file)
    }

    emit('updated', updatedEntity)
    editMode.value = false
    resetAvatarEditor()
    await nextTick()
    await avatar.value?.reload()
    toast.add({ title: t('custom_tree.entity.updated'), color: 'success' })
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    isSaving.value = false
  }
}

async function remove() {
  if (!props.entity.id || !window.confirm(t('custom_tree.entity.confirm_delete', { name: props.entity.name }))) return
  isDeleting.value = true
  try {
    await sendDeleteCustomEntityRequest(props.treeId, props.entity.id)
    open.value = false
    emit('structureChanged')
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    isDeleting.value = false
  }
}

watch(() => props.entity, sync, { immediate: true })
watch(open, (isOpen) => {
  if (!isOpen) cancelEdit()
})
onBeforeUnmount(resetAvatarEditor)
</script>

<template>
  <UModal
    v-model:open="open"
    :title="entity.name || t('custom_tree.entity.unnamed')"
    :description="t('custom_tree.entity.modal_description')"
    :ui="{ content: 'max-h-[90dvh] overflow-y-auto sm:max-w-2xl' }"
  >
    <template #body>
      <div class="mx-auto flex w-full flex-col gap-4">
        <div class="flex flex-col items-start gap-4 rounded-2xl sm:flex-row sm:items-center">
          <CustomEntityAvatar
            ref="avatar"
            :tree-id="treeId"
            :entity="entity"
            :size="20"
          />
          <div class="min-w-0">
            <h2 class="text-xl font-bold text-accented sm:text-2xl">
              {{ entity.name || t('custom_tree.entity.unnamed') }}
            </h2>
          </div>
          <UButton
            v-if="entity.id"
            type="button"
            color="neutral"
            variant="soft"
            icon="i-lucide-images"
            class="sm:ml-auto"
            @click="galleryOpen = true"
          >
            {{ t('photo_gallery.open') }}
          </UButton>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold tracking-wider text-muted uppercase">
              {{ t('custom_tree.entity.name') }}
            </p>
            <UInput
              v-model="name"
              :disabled="!editMode"
              color="neutral"
              variant="subtle"
              class="w-full"
              :ui="treeFieldUi"
              @keyup.enter="save"
            />
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold tracking-wider text-muted uppercase">
              {{ t('custom_tree.entity.description') }}
            </p>
            <UTextarea
              v-model="description"
              :disabled="!editMode"
              color="neutral"
              variant="subtle"
              class="w-full"
              :rows="4"
              :ui="treeTextareaUi"
            />
          </div>
        </div>

        <div
          v-if="editMode"
          class="mt-2 flex flex-col gap-4 rounded-2xl border border-default p-4"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-semibold tracking-wider text-muted uppercase">
              {{ t('tree.person_modal.avatar.label') }}
            </p>
            <UButton
              type="button"
              color="neutral"
              variant="subtle"
              size="md"
              icon="i-lucide-image"
              @click="fileInput?.click()"
            >
              {{ t('custom_tree.entity.choose_avatar') }}
            </UButton>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="selectFile"
          >
          <div
            v-if="sourceUrl"
            class="relative mx-auto aspect-square w-full max-w-75 overflow-hidden border border-default bg-neutral-900/5"
          >
            <AvatarCropper
              ref="cropper"
              :src="sourceUrl"
              :aspect-ratio="1"
              class="h-full w-full"
            />
          </div>
        </div>
      </div>

      <div class="mt-4 flex w-full flex-wrap items-center justify-between gap-3">
        <template v-if="!editMode">
          <div class="ml-auto flex gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="closeModal"
            >
              {{ t('tree.person_modal.actions.close') }}
            </UButton>
            <UButton
              v-if="editable"
              color="primary"
              icon="i-lucide-pencil"
              @click="editMode = true"
            >
              {{ t('tree.person_modal.actions.edit') }}
            </UButton>
          </div>
        </template>
        <template v-else>
          <UButton
            v-if="!isRoot"
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            :loading="isDeleting"
            @click="remove"
          >
            {{ t('custom_tree.entity.delete') }}
          </UButton>
          <div class="ml-auto flex gap-2">
            <UButton
              color="neutral"
              variant="soft"
              @click="cancelEdit"
            >
              {{ t('common.cancel') }}
            </UButton>
            <UButton
              color="primary"
              :loading="isSaving"
              :disabled="!name.trim()"
              @click="save"
            >
              {{ t('tree.person_modal.actions.save') }}
            </UButton>
          </div>
        </template>
      </div>
    </template>
  </UModal>

  <PersonPhotoGalleryModal
    v-if="entity.id"
    v-model:open="galleryOpen"
    :tree-id="treeId"
    :subject-id="entity.id"
    source="custom"
    :editable="editable"
  />
</template>
