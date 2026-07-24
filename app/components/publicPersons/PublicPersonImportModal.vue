<script setup lang="ts">
import PublicPersonImportListItem from '~/components/publicPersons/PublicPersonImportListItem.vue'
import PublicPersonModal from '~/components/publicPersons/PublicPersonModal.vue'
import NewPublicPersonModal from '~/components/publicPersons/NewPublicPersonModal.vue'
import { useAvailableTags } from '~/composables/tags/useAvailableTags'
import {
  type PublicPersonAttachment,
  usePublicPersonBrowser
} from '~/composables/publicPersons/usePublicPersonBrowser'
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import type { PublicPersonCardItem } from '~/utils/ui/publicPersons/mapPublicPersonToCardItem'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  treeId: string
  attachToPersonId?: string
  attachment?: PublicPersonAttachment
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'imported': [person: PersonDTO]
}>()

const modalOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const selectedTags = ref<string[]>([])
const tagsPopoverOpen = ref(false)
const selectedPublicPerson = ref<PublicPersonCardItem | null>(null)
const isPublicPersonModalOpen = ref(false)
const isNewPublicPersonModalOpen = ref(false)

const {
  query,
  items,
  loading,
  importingId,
  loadPersons,
  importPerson,
  cleanup
} = usePublicPersonBrowser(
  computed(() => props.treeId),
  computed(() => props.attachToPersonId),
  computed(() => props.attachment),
  selectedTags
)

const { tags, loading: tagsLoading, loadTags } = useAvailableTags()
const toast = useToast()

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

function openPersonInfo(item: PublicPersonCardItem) {
  selectedPublicPerson.value = item
  isPublicPersonModalOpen.value = true
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    query.value = ''
    selectedTags.value = []
    void loadPersons()
  }
})

watch([query, selectedTags], () => {
  if (props.open) {
    void loadPersons()
  }
}, { deep: true })

watch(tagsPopoverOpen, (isOpen) => {
  if (isOpen) {
    void loadTags()
  }
})

async function handleImport(item: PublicPersonCardItem) {
  const person = await importPerson(item)

  if (!person) {
    return
  }

  toast.add({
    title: t('public_persons.import.success_title'),
    color: 'success'
  })

  emit('imported', person)
  modalOpen.value = false
}

async function handleCreated() {
  await loadPersons()
}

onBeforeUnmount(() => {
  cleanup()
})
</script>

<template>
  <UModal
    v-model:open="modalOpen"
    :title="t('public_persons.import.title')"
    :description="t('public_persons.import.description')"
    :ui="{ content: 'max-h-[90dvh] overflow-y-auto sm:max-w-3xl' }"
  >
    <template #body>
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <UInput
            v-model="query"
            class="flex-1"
            :placeholder="t('public_persons.import.search_placeholder')"
            icon="i-lucide-search"
            color="primary"
            variant="subtle"
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
                  v-if="tagsLoading"
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

          <UButton
            color="primary"
            icon="i-lucide-plus"
            @click="isNewPublicPersonModalOpen = true"
          >
            {{ t('my.public_persons.actions.new_person') }}
          </UButton>
        </div>

        <div
          v-if="loading"
          class="py-8 text-center text-sm text-muted"
        >
          {{ t('public_persons.import.loading') }}
        </div>

        <div
          v-else-if="items.length"
          class="space-y-3"
        >
          <PublicPersonImportListItem
            v-for="item in items"
            :key="item.id"
            :item="item"
            :loading="importingId === item.id"
            @import="handleImport"
            @info="openPersonInfo"
          />
        </div>

        <p
          v-else
          class="py-8 text-center text-sm text-muted"
        >
          {{ t('public_persons.import.no_results') }}
        </p>
      </div>
    </template>
  </UModal>

  <PublicPersonModal
    v-model:open="isPublicPersonModalOpen"
    :person="selectedPublicPerson?.person ?? null"
    :editable="false"
    :show-create-tree-action="false"
  />

  <NewPublicPersonModal
    v-model:open="isNewPublicPersonModalOpen"
    @created="handleCreated"
  />
</template>
