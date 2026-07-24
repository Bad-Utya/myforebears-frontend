<script setup lang="ts">
import AvatarCropper from '~/components/common/AvatarCropper.vue'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [blob: Blob]
}>()

const isModalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const fileInput = ref<HTMLInputElement | null>(null)
const avatarCropper = ref<any>(null)
const avatarSourceUrl = ref<string | null>(null)

function revokeUrl() {
  if (avatarSourceUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(avatarSourceUrl.value)
  }
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !file.type.startsWith('image/')) return

  revokeUrl()
  avatarSourceUrl.value = URL.createObjectURL(file)
}

async function onSave() {
  if (!avatarCropper.value) return
  const blob = await avatarCropper.value.exportBlob('image/png', 512)
  emit('save', blob)
}

function close() {
  isModalVisible.value = false
  revokeUrl()
  avatarSourceUrl.value = null
}
</script>

<template>
  <UModal
    v-model:open="isModalVisible"
    @close="close"
    :title="t('settings.avatar_modal.title')"
    :ui="{ content: 'sm:max-w-md' }"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <div class="relative aspect-square w-full bg-neutral-900/5 overflow-hidden border-2 border-dashed border-default flex items-center justify-center">
          <AvatarCropper
            v-if="avatarSourceUrl"
            ref="avatarCropper"
            :src="avatarSourceUrl"
            class="w-full h-full"
          />
          <div v-else class="text-sm text-muted italic text-center p-8">
            {{ t('settings.avatar_modal.no_image') }}
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          >

          <div class="flex gap-2 pt-2">
            <UButton
              variant="soft"
              color="neutral"
              icon="i-lucide-image"
              @click="fileInput?.click()"
            >
              {{ avatarSourceUrl ? t('settings.avatar_modal.change_image') : t('settings.avatar_modal.select_image') }}
            </UButton>

            <UButton
              color="neutral"
              variant="ghost"
              class="ml-auto"
              @click="close">
              {{ t('common.cancel') }}
            </UButton>
            <UButton
              :loading="props.loading"
              :disabled="!avatarSourceUrl"
              class="px-4"
              @click="onSave"
            >
              {{ t('settings.avatar_modal.apply') }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
