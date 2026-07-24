<script setup lang="ts">
import AvatarCropper from '~/components/common/AvatarCropper.vue'
import { treeFieldUi, treeTextareaUi } from '~/utils/ui/theme/treeTheme'
import type TreeDTO from '~/services/familytree/dtos/inner/TreeDTO'

const { t } = useI18n()

const props = defineProps<{
  tree: TreeDTO | null
  editable: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  save: [data: { name: string, description: string, isPublic: boolean, isRestricted: boolean, avatar: File | null }]
}>()

const treeName = ref('')
const treeDescription = ref('')
const isPublicOnMainPage = ref(false)
const isViewRestricted = ref(false)

const avatarFileInput = ref<HTMLInputElement | null>(null)
const avatarCropper = ref<any>(null)
const avatarSourceUrl = ref<string | null>(null)
const avatarChanged = ref(false)

const sync = () => {
  treeName.value = props.tree?.name ?? props.tree?.title ?? ''
  treeDescription.value = props.tree?.description ?? ''
  isPublicOnMainPage.value = Boolean(props.tree?.is_public_on_main_page)
  isViewRestricted.value = Boolean(props.tree?.is_view_restricted)
}

watch(() => props.tree, sync, { immediate: true })
watch(isPublicOnMainPage, (val) => { if (val) isViewRestricted.value = false })

async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  if (avatarSourceUrl.value) URL.revokeObjectURL(avatarSourceUrl.value)

  avatarSourceUrl.value = URL.createObjectURL(file)
  avatarChanged.value = true
}

async function onSaveClick() {
  const avatarFile = avatarChanged.value && avatarCropper.value
    ? await avatarCropper.value.exportFile('tree-avatar.png', 512)
    : null

  emit('save', {
    name: treeName.value,
    description: treeDescription.value,
    isPublic: isPublicOnMainPage.value,
    isRestricted: isViewRestricted.value,
    avatar: avatarFile
  })
}
</script>

<template>
  <section class="rounded-xl border border-default p-4 flex flex-col gap-4">
    <UInput
      v-model="treeName"
      :disabled="!editable"
      :ui="treeFieldUi"
      :placeholder="t('tree.settings.name_placeholder')"
    />
    <UTextarea
      v-model="treeDescription"
      :disabled="!editable"
      :ui="treeTextareaUi"
      autoresize
      :rows="4"
      :placeholder="t('tree.settings.description_placeholder')"
    />

    <div class="flex flex-col gap-3">
      <UCheckbox
        v-model="isPublicOnMainPage"
        :label="t('tree.settings.public_checkbox')"
        :disabled="!editable"
      />
      <UCheckbox
        v-model="isViewRestricted"
        :label="t('tree.settings.restricted_checkbox')"
        :disabled="!editable || isPublicOnMainPage"
      />
    </div>

    <div class="flex flex-col gap-4 rounded-2xl border border-default p-4">
      <div class="flex items-center justify-between">
        <span class="text-sm">
          {{ t('tree.settings.avatar_label') }}
        </span>
        <UButton
          variant="subtle"
          color="neutral"
          size="xs"
          :disabled="!editable"
          @click="avatarFileInput?.click()"
        >
          {{ t('tree.settings.choose_image') }}
        </UButton>
      </div>
      <input ref="avatarFileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange">

      <div v-if="avatarSourceUrl" class="tree-avatar-cropper overflow-hidden">
        <AvatarCropper ref="avatarCropper" :src="avatarSourceUrl" :aspect-ratio="3/4" />
      </div>
    </div>

    <UButton
      color="primary"
      variant="soft"
      class="w-fit"
      :loading="loading"
      :disabled="!editable"
      @click="onSaveClick"
    >
      {{ t('tree.settings.save_button') }}
    </UButton>
  </section>
</template>
