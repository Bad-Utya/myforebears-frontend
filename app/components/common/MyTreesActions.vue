<script setup lang="ts">
import AvatarCropper from '~/components/common/AvatarCropper.vue'
import ApiRequestError from '~/composables/scripts/api/ApiRequestError'
import sendCreateTreeRequest from '~/composables/scripts/familytree/createTree'
import sendUploadTreeAvatarRequest from '~/composables/scripts/photos/uploadTreeAvatar'
import showApiErrorToast from '~/composables/scripts/ui/showApiErrorToast'

const emit = defineEmits<{
  changed: []
}>()

const toast = useToast()
const modalOpen = ref(false)
const pending = ref(false)
const treeName = ref('')
const treeDescription = ref('')
const avatarFileInput = ref<HTMLInputElement | null>(null)
const avatarCropper = ref<{ exportFile: (fileName?: string, size?: number) => Promise<File> } | null>(null)
const avatarSourceUrl = ref<string | null>(null)

const isSubmitDisabled = computed(() => {
  if (pending.value) {
    return true
  }

  return !treeName.value.trim()
})

function revokeAvatarSourceUrl() {
  if (!avatarSourceUrl.value?.startsWith('blob:')) {
    return
  }

  URL.revokeObjectURL(avatarSourceUrl.value)
}

function resetAvatarEditor() {
  revokeAvatarSourceUrl()
  avatarSourceUrl.value = null

  if (avatarFileInput.value) {
    avatarFileInput.value.value = ''
  }
}

async function buildAvatarFile() {
  if (!avatarCropper.value) {
    return null
  }

  return await avatarCropper.value.exportFile('tree-avatar.png', 512)
}

function resetForm() {
  treeName.value = ''
  treeDescription.value = ''
  resetAvatarEditor()
}

function openModal() {
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  resetForm()
}

async function createTree() {
  pending.value = true

  try {
    const response = await sendCreateTreeRequest(
      treeName.value.trim(),
      treeDescription.value.trim() || undefined
    )
    const createdTree = response.data?.tree
    const treeId = createdTree?.id ?? createdTree?.tree_id

    if (!treeId) {
      throw new ApiRequestError('tree_not_found', 'Created tree id is missing')
    }

    const avatarFile = await buildAvatarFile()

    if (avatarFile) {
      await sendUploadTreeAvatarRequest(treeId, avatarFile)
    }

    toast.add({
      title: 'Tree created',
      description: 'A new family tree was added to your collection.',
      color: 'success'
    })

    closeModal()
    emit('changed')
    await navigateTo(`/trees/${treeId}/main`)
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    pending.value = false
  }
}

async function handleAvatarFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    toast.add({
      title: 'Please choose an image file',
      color: 'error'
    })
    input.value = ''
    return
  }

  try {
    revokeAvatarSourceUrl()
    avatarSourceUrl.value = URL.createObjectURL(file)
  } catch (error) {
    showApiErrorToast(error)
  }
}

async function submit() {
  await createTree()
}

onBeforeUnmount(() => {
  resetAvatarEditor()
})
</script>

<template>
  <div>
    <UButton
      size="lg"
      color="primary"
      variant="soft"
      icon="i-lucide-plus"
      @click="openModal"
    >
      New tree
    </UButton>

    <UModal
      v-model:open="modalOpen"
      title="Create tree"
      description="Create a new tree"
      :ui="{
        content: 'bg-default flex flex-col focus:outline-none'
      }"
    >
      <template #body>
        <form
          class="mx-auto flex w-full max-w-3xl flex-col gap-4"
          @submit.prevent="submit"
        >
          <div class="space-y-4">
            <UFormField
              label="Tree name"
              required
            >
              <UInput
                v-model="treeName"
                placeholder="My family tree"
                size="lg"
                color="neutral"
                variant="subtle"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Description"
            >
              <UTextarea
                v-model="treeDescription"
                :rows="4"
                autoresize
                color="neutral"
                variant="subtle"
                placeholder="What this tree is about"
                class="w-full"
              />
            </UFormField>

            <div class="space-y-3 rounded-2xl border border-default bg-default p-4">
              <div class="flex flex-row items-center gap-3">
                <p class="text-sm font-medium text-highlighted">
                  Tree avatar
                </p>

                <UButton
                  type="button"
                  color="neutral"
                  variant="subtle"
                  class="w-fit ml-auto"
                  @click="avatarFileInput?.click()"
                >
                  Choose image
                </UButton>
              </div>

              <input
                ref="avatarFileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleAvatarFileChange"
              >

              <div
                v-if="avatarSourceUrl"
                class="space-y-3"
              >
                <div class="tree-avatar-cropper mx-auto overflow-hidden rounded-4xl border border-default bg-elevated/70">
                  <AvatarCropper
                    ref="avatarCropper"
                    :src="avatarSourceUrl"
                    :aspect-ratio="3 / 4"
                    class="mx-auto block h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              @click="closeModal"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              :loading="pending"
              :disabled="isSubmitDisabled"
            >
              Create
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.tree-avatar-cropper {
  width: 100%;
  min-height: 20rem;
  max-height: 28rem;
}

.tree-avatar-cropper :deep(.vue-advanced-cropper) {
  height: 100%;
  min-height: 20rem;
}
</style>
