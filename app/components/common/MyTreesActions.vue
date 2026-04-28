<script setup lang="ts">
import AvatarCropper from '~/components/common/AvatarCropper.vue'
import ApiRequestError from '~/composables/scripts/api/ApiRequestError'
import sendCreateTreeRequest from '~/composables/scripts/familytree/createTree'
import sendImportGedcomRequest from '~/composables/scripts/familytree/importGedcom'
import sendUpdateTreeSettingsRequest from '~/composables/scripts/familytree/updateTreeSettings'
import sendUploadTreeAvatarRequest from '~/composables/scripts/photos/uploadTreeAvatar'
import showApiErrorToast from '~/composables/scripts/ui/showApiErrorToast'

type TreeActionMode = 'create' | 'import'

const emit = defineEmits<{
  changed: []
}>()

const toast = useToast()
const modalOpen = ref(false)
const mode = ref<TreeActionMode>('create')
const pending = ref(false)
const treeName = ref('')
const gedcomContent = ref('')
const selectedFileName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const avatarFileInput = ref<HTMLInputElement | null>(null)
const avatarCropper = ref<{ exportFile: (fileName?: string, size?: number) => Promise<File> } | null>(null)
const avatarSourceUrl = ref<string | null>(null)

const isSubmitDisabled = computed(() => {
  if (pending.value) {
    return true
  }

  if (mode.value === 'create') {
    return !treeName.value.trim()
  }

  if (mode.value === 'import') {
    return !gedcomContent.value.trim()
  }

  return false
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
  gedcomContent.value = ''
  selectedFileName.value = ''
  resetAvatarEditor()

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function openModal() {
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  mode.value = 'create'
  resetForm()
}

async function createTree() {
  pending.value = true

  try {
    const response = await sendCreateTreeRequest()
    const createdTree = response.data?.tree
    const treeId = createdTree?.id ?? createdTree?.tree_id

    if (!treeId) {
      throw new ApiRequestError('tree_not_found', 'Created tree id is missing')
    }

    await sendUpdateTreeSettingsRequest(
      treeId,
      createdTree?.is_public_on_main_page ?? false,
      createdTree?.is_view_restricted ?? false,
      treeName.value.trim()
    )

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
    await navigateTo(`/trees/${treeId}`)
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    pending.value = false
  }
}

async function handleGedcomFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  try {
    gedcomContent.value = await file.text()
    selectedFileName.value = file.name
  } catch (error) {
    showApiErrorToast(error)
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

async function importGedcom() {
  if (!gedcomContent.value.trim()) {
    return
  }

  pending.value = true

  try {
    await sendImportGedcomRequest(gedcomContent.value)
    toast.add({
      title: 'GEDCOM imported',
      description: 'The tree list was updated after import.',
      color: 'success'
    })
    closeModal()
    emit('changed')
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    pending.value = false
  }
}

async function submit() {
  if (mode.value === 'import') {
    await importGedcom()
    return
  }

  await createTree()
}

onBeforeUnmount(() => {
  resetAvatarEditor()
})
</script>

<template>
  <div>
    <UButton
      size="sm"
      color="neutral"
      variant="soft"
      icon="i-lucide-plus"
      @click="openModal"
    >
      New tree
    </UButton>

    <UModal
      v-model:open="modalOpen"
      title="Create tree"
      description="Create an empty tree or import one from GEDCOM."
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="submit"
        >
          <div class="inline-flex rounded-full border border-default p-1">
            <UButton
              type="button"
              color="neutral"
              size="xs"
              :variant="mode === 'create' ? 'soft' : 'ghost'"
              @click="mode = 'create'"
            >
              Create
            </UButton>
            <UButton
              type="button"
              color="neutral"
              size="xs"
              :variant="mode === 'import' ? 'soft' : 'ghost'"
              @click="mode = 'import'"
            >
              Import
            </UButton>
          </div>

          <template v-if="mode === 'create'">
            <div class="space-y-4">
              <UFormField
                label="Tree name"
                required
              >
                <UInput
                  v-model="treeName"
                  placeholder="My family tree"
                  size="lg"
                />
              </UFormField>

              <div class="space-y-3 rounded-2xl border border-default bg-default/60 p-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-medium text-highlighted">
                      Tree avatar
                    </p>
                    <p class="text-xs text-muted">
                      Upload and crop the main image for this tree.
                    </p>
                  </div>

                  <UButton
                    type="button"
                    color="neutral"
                    variant="outline"
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
                  <div
                    class="tree-avatar-cropper mx-auto overflow-hidden rounded-4xl border border-default bg-elevated/70"
                  >
                    <AvatarCropper
                      ref="avatarCropper"
                      :src="avatarSourceUrl"
                      :aspect-ratio="3 / 4"
                      class="mx-auto block h-full w-full object-contain"
                    />
                  </div>
                  <p class="text-xs text-muted">
                    Avatar will be cropped to the same portrait ratio used in tree cards.
                  </p>
                </div>

                <p
                  v-else
                  class="text-sm text-muted"
                >
                  Avatar is optional. You can add or change it later.
                </p>
              </div>
            </div>
          </template>

          <template v-else>
            <input
              ref="fileInput"
              type="file"
              accept=".ged,.gedcom,text/plain"
              class="hidden"
              @change="handleGedcomFileChange"
            >

            <div class="flex flex-wrap items-center gap-3">
              <UButton
                type="button"
                color="neutral"
                variant="outline"
                @click="fileInput?.click()"
              >
                Choose file
              </UButton>
              <span class="text-sm text-muted">
                {{ selectedFileName || 'No file selected' }}
              </span>
            </div>

            <UTextarea
              v-model="gedcomContent"
              :rows="12"
              autoresize
              placeholder="0 HEAD&#10;1 GEDC&#10;2 VERS 5.5.1&#10;..."
            />
          </template>

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
              {{ mode === 'import' ? 'Import' : 'Create' }}
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.tree-avatar-cropper {
  width: min(100%, 15rem);
  aspect-ratio: 3 / 4;
}

.tree-avatar-cropper :deep(.vue-advanced-cropper) {
  min-height: 18rem;
}
</style>
