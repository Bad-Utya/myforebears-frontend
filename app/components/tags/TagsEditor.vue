<script setup lang="ts">
import type TagDTO from '~/services/tags/dtos/inner/TagDTO'
import { useAvailableTags } from '~/composables/tags/useAvailableTags'

const props = withDefaults(defineProps<{
  currentTags?: TagDTO[]
  editable?: boolean
}>(), {
  currentTags: () => [],
  editable: false
})
const selectedTagCodes = defineModel<string[]>({ default: () => [] })
const { t } = useI18n()
const popoverOpen = ref(false)
const selectedTagCode = ref<string>()
const { tags, loading, loadTags } = useAvailableTags()

const selectedTags = computed(() => selectedTagCodes.value
  .map(code => tags.value.find(tag => tag.code === code) ?? props.currentTags.find(tag => tag.code === code))
  .filter((tag): tag is TagDTO => Boolean(tag)))

const availableTagOptions = computed(() => tags.value
  .filter(tag => tag.code && !selectedTagCodes.value.includes(tag.code))
  .map(tag => ({
    label: tag.name ?? tag.code ?? '',
    value: tag.code ?? '',
    description: tag.description
  })))

function addTag() {
  if (!selectedTagCode.value || selectedTagCodes.value.includes(selectedTagCode.value)) return
  selectedTagCodes.value = [...selectedTagCodes.value, selectedTagCode.value]
  selectedTagCode.value = undefined
}

function removeTag(code?: string) {
  if (!code) return
  selectedTagCodes.value = selectedTagCodes.value.filter(selectedCode => selectedCode !== code)
}

watch(popoverOpen, (isOpen) => {
  if (isOpen) void loadTags()
})
</script>

<template>
  <div class="flex flex-col gap-4 rounded-2xl border border-default p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm">
          {{ t('tree.settings.tags_title') }}
        </p>
        <p class="text-xs text-muted">
          {{ t('tree.settings.tags_description') }}
        </p>
      </div>

      <UPopover
        v-model:open="popoverOpen"
        :popper="{ placement: 'bottom-end' }"
      >
        <UButton
          variant="subtle"
          color="neutral"
          size="sm"
          :disabled="!editable"
          icon="i-lucide-plus"
        >
          {{ t('tree.settings.add_tag_button') }}
        </UButton>

        <template #content>
          <div class="w-72 p-4">
            <div class="space-y-3">
              <USelectMenu
                v-model="selectedTagCode"
                class="w-full"
                :items="availableTagOptions"
                value-key="value"
                :search-input="false"
                :placeholder="t('tree.settings.tag_select_placeholder')"
              />
              <UButton
                class="w-full justify-center"
                :disabled="!selectedTagCode"
                @click="addTag"
              >
                {{ t('tree.settings.add_tag_button_inner') }}
              </UButton>
              <p
                v-if="loading"
                class="text-xs text-muted"
              >
                {{ t('tree.settings.tags_loading_placeholder') }}
              </p>
            </div>
          </div>
        </template>
      </UPopover>
    </div>

    <div
      v-if="selectedTags.length"
      class="flex flex-wrap gap-2"
    >
      <button
        v-for="tag in selectedTags"
        :key="tag.code ?? tag.name"
        type="button"
        :class="[
          'group rounded-lg border border-default bg-elevated px-3 py-2 text-left transition-colors',
          editable && 'hover:border-error/40 hover:bg-error/5'
        ]"
        :disabled="!editable"
        @click="removeTag(tag.code)"
      >
        <span class="text-sm text-highlighted">
          {{ tag.name || tag.code }}
        </span>
      </button>
    </div>
    <p
      v-else
      class="text-sm text-muted"
    >
      {{ t('tree.settings.no_tags') }}
    </p>
  </div>
</template>
