<script setup lang="ts">
import { Cropper, RectangleStencil } from 'vue-advanced-cropper'
import type { CropperResult } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  src: string
  aspectRatio?: number
}>(), {
  aspectRatio: 1
})

type CropperInstance = {
  getResult: () => CropperResult
  refresh: () => void
}

const cropper = ref<CropperInstance | null>(null)

function defaultSize({ visibleArea, imageSize }: { visibleArea?: { width: number, height: number } | null, imageSize: { width: number, height: number } }) {
  const area = visibleArea ?? imageSize
  const maxWidth = area.width * 0.85
  const maxHeight = area.height * 0.85
  const maxHeightFromWidth = maxWidth / props.aspectRatio
  const height = Math.min(maxHeight, maxHeightFromWidth)
  const width = height * props.aspectRatio

  return { width, height }
}

function getCanvas(size = 512) {
  const result = cropper.value?.getResult()
  const canvas = result?.canvas

  if (!canvas) {
    throw new Error(t('errors.avatar.export_failed'))
  }

  const output = document.createElement('canvas')
  output.width = size
  output.height = Math.round(size / props.aspectRatio)

  const context = output.getContext('2d')

  if (!context) {
    throw new Error(t('errors.avatar.context_unavailable'))
  }

  context.clearRect(0, 0, output.width, output.height)
  context.drawImage(canvas, 0, 0, output.width, output.height)

  return output
}

async function exportBlob(type: string = 'image/png', size = 512) {
  const canvas = getCanvas(size)

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error(t('errors.avatar.export_failed')))
        return
      }

      resolve(blob)
    }, type)
  })
}

async function exportFile(fileName = 'avatar.png', size = 512) {
  const blob = await exportBlob('image/png', size)
  return new File([blob], fileName, { type: 'image/png' })
}

function refresh() {
  cropper.value?.refresh()
}

defineExpose({
  exportBlob,
  exportFile,
  getCanvas,
  refresh
})
</script>

<template>
  <Cropper
    ref="cropper"
    class="avatar-cropper h-full w-full"
    :src="props.src"
    :debounce="0"
    :canvas="true"
    :transitions="true"
    :auto-zoom="true"
    image-restriction="stencil"
    :stencil-component="RectangleStencil"
    :stencil-props="{ aspectRatio: props.aspectRatio }"
    :default-size="defaultSize"
  />
</template>

<style scoped>
.avatar-cropper {
  min-height: 100%;
}

.avatar-cropper:deep(.vue-advanced-cropper__background) {
  background: color-mix(in srgb, var(--ui-bg-elevated) 70%, transparent 30%);
}

.avatar-cropper:deep(.vue-advanced-cropper__foreground) {
  background: color-mix(in srgb, black 48%, transparent 52%);
}

.avatar-cropper:deep(.vue-simple-handler) {
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid rgb(255 255 255 / 0.95);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.3);
  backdrop-filter: blur(4px);
}

.avatar-cropper:deep(.vue-simple-line) {
  background: rgb(255 255 255 / 0.35);
}

.avatar-cropper:deep(.vue-rectangle-stencil) {
  border: 1px solid rgb(255 255 255 / 0.95);
  box-shadow: 0 0 0 1px rgb(255 255 255 / 0.14);
}
</style>
