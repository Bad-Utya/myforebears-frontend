<script setup lang="ts">
import { useCreateTree } from '~/composables/my/useCreateTree'
import { useImportTree } from '~/composables/my/useImportTree'

const { t } = useI18n()

const isOpen = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ changed: [] }>()

const avatarFileInput = ref<HTMLInputElement | null>(null)
const avatarCropper = ref<{ exportFile: (fileName?: string, size?: number) => Promise<File> } | null>(null)

const handleSuccess = async (treeId: string, kind: 'family' | 'custom' = 'family') => {
  isOpen.value = false
  emit('changed')
  await navigateTo(kind === 'custom' ? `/custom-trees/${treeId}/main` : `/trees/${treeId}/main`)
}

const createLogic = useCreateTree(handleSuccess)
const importLogic = useImportTree(handleSuccess)

createLogic.avatarFileInput = avatarFileInput
createLogic.avatarCropper = avatarCropper

const tabs = computed(() => [
  { label: t('my.new_tree_modal.tabs.create'), icon: '', slot: 'create' },
  { label: t('my.new_tree_modal.tabs.import'), icon: '', slot: 'import' }
])

watch(isOpen, (val) => {
  if (!val) {
    createLogic.resetForm()
    importLogic.gedcomFile.value = null
  }
})

onBeforeUnmount(() => createLogic.resetAvatarEditor())
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="t('my.new_tree_modal.title')"
    :description="t('my.new_tree_modal.description')"
    :ui="{ content: 'bg-default flex max-h-[90dvh] flex-col overflow-y-auto max-w-md' }"
  >
    <template #body>
      <UTabs :items="tabs">
        <template #create>
          <form
            class="mt-4 flex flex-col gap-4"
            @submit.prevent="createLogic.createTree"
          >
            <div class="space-y-4">
              <UFormField
                :label="t('my.new_tree_modal.form.name_label')"
                required
              >
                <UInput
                  v-model="createLogic.treeName.value"
                  :placeholder="t('my.new_tree_modal.form.name_placeholder')"
                  size="lg"
                  color="neutral"
                  variant="subtle"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                :label="t('my.new_tree_modal.form.type_label')"
                required
              >
                <USelect
                  v-model="createLogic.treeKind.value"
                  class="w-full"
                  value-key="value"
                  :items="[
                    { label: t('my.new_tree_modal.form.family_type'), value: 'family' },
                    { label: t('my.new_tree_modal.form.custom_type'), value: 'custom' }
                  ]"
                />
              </UFormField>

              <template v-if="createLogic.treeKind.value === 'custom'">
                <UFormField
                  :label="t('my.new_tree_modal.form.relation_up_label')"
                  required
                >
                  <UInput
                    v-model="createLogic.relationUp.value"
                    :placeholder="t('my.new_tree_modal.form.relation_up_placeholder')"
                    size="lg"
                    color="neutral"
                    variant="subtle"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  :label="t('my.new_tree_modal.form.relation_down_label')"
                  required
                >
                  <UInput
                    v-model="createLogic.relationDown.value"
                    :placeholder="t('my.new_tree_modal.form.relation_down_placeholder')"
                    size="lg"
                    color="neutral"
                    variant="subtle"
                    class="w-full"
                  />
                </UFormField>
              </template>

              <UFormField :label="t('my.new_tree_modal.form.desc_label')">
                <UTextarea
                  v-model="createLogic.treeDescription.value"
                  :rows="3"
                  autoresize
                  :placeholder="t('my.new_tree_modal.form.desc_placeholder')"
                  class="w-full"
                  color="neutral"
                  variant="subtle"
                />
              </UFormField>

              <!--              <div class="flex flex-col gap-4 rounded-2xl border border-default p-4"> -->
              <!--                <div class="flex items-center justify-between"> -->
              <!--                  <p class="text-sm text-highlighted">{{ t('my.new_tree_modal.form.avatar_label') }}</p> -->
              <!--                  <UButton type="button" color="neutral" variant="subtle" size="md" @click="createLogic.avatarFileInput.value?.click()"> -->
              <!--                    {{ t('my.new_tree_modal.form.choose_image') }} -->
              <!--                  </UButton> -->
              <!--                </div> -->
              <!--                <input ref="avatarFileInput" type="file" accept="image/*" class="hidden" @change="createLogic.handleAvatarFileChange"> -->
              <!---->
              <!--                <div v-if="createLogic.avatarSourceUrl.value" class="tree-avatar-cropper"> -->
              <!--                  <AvatarCropper -->
              <!--                    ref="avatarCropper" -->
              <!--                    :src="createLogic.avatarSourceUrl.value" -->
              <!--                    :aspect-ratio="3 / 4" -->
              <!--                    class="h-full w-full object-contain" -->
              <!--                  /> -->
              <!--                </div> -->
              <!--              </div> -->
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-end gap-2">
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                @click="isOpen = false"
              >
                {{ t('common.cancel') }}
              </UButton>
              <UButton
                type="submit"
                :loading="createLogic.pending.value"
                :disabled="createLogic.isSubmitDisabled.value"
              >
                {{ t('my.new_tree_modal.form.submit') }}
              </UButton>
            </div>
          </form>
        </template>

        <template
          v-if="createLogic.treeKind.value === 'family'"
          #import
        >
          <div class="mt-4 flex flex-col gap-8">
            <div
              class="flex flex-col items-center justify-center border-2 border-dashed border-default rounded-2xl p-8 transition-colors hover:bg-neutral/5 cursor-pointer"
              @click="() => ($refs.gedcomInput as HTMLInputElement).click()"
            >
              <UIcon
                name="i-lucide-upload-cloud"
                class="size-12 text-muted mb-4"
              />
              <p class="text-sm font-medium text-highlighted">
                {{ importLogic.gedcomFile.value ? importLogic.gedcomFile.value.name : t('my.new_tree_modal.import.click_to_upload') }}
              </p>
              <p class="text-xs text-muted mt-1">
                {{ t('my.new_tree_modal.import.support_text') }}
              </p>

              <input
                ref="gedcomInput"
                type="file"
                accept=".ged"
                class="hidden"
                @change="importLogic.handleFileSelect"
              >
            </div>

            <div class="flex flex-wrap items-center justify-end gap-2">
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                @click="isOpen = false"
              >
                {{ t('common.cancel') }}
              </UButton>
              <UButton
                type="button"
                :loading="importLogic.pending.value"
                :disabled="importLogic.isImportDisabled.value"
                @click="importLogic.importTree"
              >
                {{ t('my.new_tree_modal.import.submit') }}
              </UButton>
            </div>
          </div>
        </template>
      </UTabs>
    </template>
  </UModal>
</template>
