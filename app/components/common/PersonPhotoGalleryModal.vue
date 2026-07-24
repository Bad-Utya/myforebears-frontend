<script setup lang="ts">
import sendListPersonPhotosRequest from '~/services/photos/listPersonPhotos'
import sendUploadPersonPhotoRequest from '~/services/photos/uploadPersonPhoto'
import sendGetPhotoRequest from '~/services/photos/getPhoto'
import sendDeletePhotoRequest from '~/services/photos/deletePhoto'
import sendListCustomEntityPhotosRequest from '~/services/customTrees/listCustomEntityPhotos'
import sendUploadCustomEntityPhotoRequest from '~/services/customTrees/uploadCustomEntityPhoto'
import sendGetCustomEntityPhotoRequest from '~/services/customTrees/getCustomEntityPhoto'
import sendDeleteCustomEntityPhotoRequest from '~/services/customTrees/deleteCustomEntityPhoto'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

type GallerySource = 'family' | 'custom'
type GalleryPhoto = {
  id: string
  fileName: string | undefined
  url: string
}

const props = defineProps<{
  treeId: string
  subjectId: string
  source: GallerySource
  editable?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })
const { t } = useI18n()
const fileInput = ref<HTMLInputElement | null>(null)
const photos = ref<GalleryPhoto[]>([])
const loading = ref(false)
const uploading = ref(false)
const deletingId = ref<string | null>(null)
const previewOpen = ref(false)
const selectedPhoto = ref<GalleryPhoto | null>(null)

function revokePhotos() {
  previewOpen.value = false
  selectedPhoto.value = null

  for (const photo of photos.value) {
    if (photo.url.startsWith('blob:')) URL.revokeObjectURL(photo.url)
  }
  photos.value = []
}

function openPreview(photo: GalleryPhoto) {
  selectedPhoto.value = photo
  previewOpen.value = true
}

async function loadPhotos() {
  if (!open.value || !props.treeId || !props.subjectId) return
  loading.value = true
  revokePhotos()

  try {
    const response = props.source === 'family'
      ? await sendListPersonPhotosRequest(props.treeId, props.subjectId)
      : await sendListCustomEntityPhotosRequest(props.treeId, props.subjectId)

    const photoItems = response.data?.photos ?? []
    const loaded = await Promise.all(photoItems.map(async (photo) => {
      const id = photo.id ?? ('photo_id' in photo ? photo.photo_id : undefined)
      if (!id) return null

      try {
        const blob = props.source === 'family'
          ? await sendGetPhotoRequest(props.treeId, id)
          : await sendGetCustomEntityPhotoRequest(props.treeId, props.subjectId, id)

        return {
          id,
          fileName: photo.file_name,
          url: URL.createObjectURL(blob)
        }
      } catch {
        return null
      }
    }))

    photos.value = loaded.filter((photo): photo is GalleryPhoto => photo !== null)
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    loading.value = false
  }
}

async function uploadPhotos(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? []).filter(file => file.type.startsWith('image/'))
  if (!files.length) return

  uploading.value = true
  try {
    for (const file of files) {
      if (props.source === 'family') {
        await sendUploadPersonPhotoRequest(props.treeId, props.subjectId, file)
      } else {
        await sendUploadCustomEntityPhotoRequest(props.treeId, props.subjectId, file)
      }
    }
    await loadPhotos()
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function deletePhoto(photo: GalleryPhoto) {
  if (!window.confirm(t('photo_gallery.confirm_delete'))) return
  deletingId.value = photo.id

  try {
    if (props.source === 'family') {
      await sendDeletePhotoRequest(props.treeId, photo.id)
    } else {
      await sendDeleteCustomEntityPhotoRequest(props.treeId, props.subjectId, photo.id)
    }
    await loadPhotos()
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    deletingId.value = null
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    void loadPhotos()
  } else {
    revokePhotos()
  }
})

watch(
  () => [props.treeId, props.subjectId, props.source],
  () => {
    if (open.value) void loadPhotos()
  }
)

onBeforeUnmount(revokePhotos)
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('photo_gallery.title')"
    :description="t('photo_gallery.description')"
    :ui="{ content: 'max-h-[90dvh] overflow-y-auto sm:max-w-4xl' }"
  >
    <template #body>
      <div class="flex min-h-48 flex-col gap-4">
        <div
          v-if="props.editable"
          class="flex justify-end"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="uploadPhotos"
          >
          <UButton
            type="button"
            color="primary"
            variant="soft"
            icon="i-lucide-image-plus"
            :loading="uploading"
            @click="fileInput?.click()"
          >
            {{ t('photo_gallery.add') }}
          </UButton>
        </div>

        <div
          v-if="loading"
          class="flex flex-1 items-center justify-center py-12"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="size-8 animate-spin text-muted"
          />
        </div>

        <div
          v-else-if="photos.length"
          class="grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          <figure
            v-for="photo in photos"
            :key="photo.id"
            class="group relative aspect-square overflow-hidden rounded-2xl border border-default bg-elevated"
          >
            <img
              :src="photo.url"
              :alt="photo.fileName || t('photo_gallery.photo_alt')"
              class="h-full w-full object-cover"
            >
            <UButton
              type="button"
              color="neutral"
              variant="solid"
              size="sm"
              icon="i-lucide-expand"
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 focus:opacity-100"
              :aria-label="t('photo_gallery.view')"
              @click="openPreview(photo)"
            />
            <UButton
              v-if="props.editable"
              type="button"
              color="error"
              variant="solid"
              size="xs"
              icon="i-lucide-trash-2"
              class="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              :loading="deletingId === photo.id"
              :aria-label="t('photo_gallery.delete')"
              @click="deletePhoto(photo)"
            />
          </figure>
        </div>

        <div
          v-else
          class="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center text-muted"
        >
          <UIcon
            name="i-lucide-images"
            class="size-10"
          />
          <p>{{ t('photo_gallery.empty') }}</p>
        </div>
      </div>
    </template>
  </UModal>

  <UModal
    v-if="selectedPhoto"
    v-model:open="previewOpen"
    :title="selectedPhoto.fileName || t('photo_gallery.photo_alt')"
    :ui="{ content: 'max-h-[95dvh] sm:max-w-6xl' }"
  >
    <template #body>
      <div class="flex min-h-64 max-h-[82dvh] items-center justify-center overflow-hidden rounded-xl bg-black/85 p-2">
        <img
          :src="selectedPhoto.url"
          :alt="selectedPhoto.fileName || t('photo_gallery.photo_alt')"
          class="max-h-[80dvh] max-w-full object-contain"
        >
      </div>
    </template>
  </UModal>
</template>
