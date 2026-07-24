<script setup lang="ts">
import { useAvailableTags } from '~/composables/tags/useAvailableTags'

const { t } = useI18n()

const email = defineModel<string>('data')
const selectedTags = defineModel<string[]>('tags', { default: () => [] })
const treeKind = defineModel<'family' | 'custom'>('treeKind', { default: 'family' })
const tagsPopoverOpen = ref(false)

const { tags, loading, loadTags } = useAvailableTags()

const isTagSelected = (tagCode?: string) => {
  if (!tagCode) {
    return false
  }

  return selectedTags.value.includes(tagCode)
}

function toggleTag(tagCode: string, checked: boolean) {
  if (checked) {
    selectedTags.value = selectedTags.value.includes(tagCode)
      ? selectedTags.value
      : [...selectedTags.value, tagCode]
    return
  }

  selectedTags.value = selectedTags.value.filter(code => code !== tagCode)
}

function clearTags() {
  selectedTags.value = []
}

watch(tagsPopoverOpen, (isOpen) => {
  if (isOpen) {
    void loadTags()
  }
})
</script>

<template>
  <div class="flex w-full items-start gap-2 lg:w-auto">
    <UInput
      v-model="email"
      :placeholder="t('main.search.button_label')"
      variant="subtle"
      color="primary"
      size="md"
      icon="i-lucide-search"
      class="w-full lg:w-80"
    />

    <UPopover
      v-model:open="tagsPopoverOpen"
      :popper="{ placement: 'bottom-end' }"
    >
      <UButton
        color="neutral"
        variant="subtle"
        icon="i-lucide-sliders-horizontal"
        :class="selectedTags.length ? 'ring-1 ring-primary/50' : ''"
      />

      <template #content>
        <div class="w-72 p-4">
          <UFormField
            class="mb-4"
            :label="t('feed.search.tree_type_title')"
          >
            <USelect
              v-model="treeKind"
              class="w-full"
              value-key="value"
              :items="[
                { label: t('feed.search.family_trees'), value: 'family' },
                { label: t('feed.search.custom_trees'), value: 'custom' }
              ]"
            />
          </UFormField>

          <div class="mb-3 flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-highlighted">
              {{ t('feed.search.tags_title') }}
            </p>
            <UButton
              v-if="selectedTags.length"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="clearTags"
            >
              {{ t('feed.search.clear_tags') }}
            </UButton>
          </div>

          <div
            v-if="loading"
            class="space-y-2"
          >
            <USkeleton
              v-for="index in 4"
              :key="index"
              class="h-8 rounded-lg"
            />
          </div>

          <div
            v-else-if="tags.length"
            class="max-h-64 space-y-2 overflow-y-auto pr-1"
          >
            <label
              v-for="tag in tags"
              :key="tag.code ?? tag.name"
              class="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
            >
              <UCheckbox
                :model-value="isTagSelected(tag.code)"
                @update:model-value="toggleTag(tag.code ?? '', Boolean($event))"
              />

              <div class="min-w-0">
                <p class="text-sm text-highlighted">
                  {{ tag.name || tag.code }}
                </p>
                <p
                  v-if="tag.description"
                  class="text-xs text-muted"
                >
                  {{ tag.description }}
                </p>
              </div>
            </label>
          </div>

          <p
            v-else
            class="text-sm text-muted"
          >
            {{ t('feed.search.no_tags') }}
          </p>
        </div>
      </template>
    </UPopover>
  </div>
</template>
