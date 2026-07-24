<script setup lang="ts">
import { useSearchTreeFast } from "~/composables/main/useSearchTreeFast";

const { t } = useI18n()

const searchTerm = ref('')
const groups = ref<any>([])
const pending = ref(false)

const router = useRouter()
const { search } = useSearchTreeFast()

const isOpen = ref(false)

watch(searchTerm, async (newQuery) => {
  if (newQuery.length < 2) {
    groups.value = []
    return
  }

  pending.value = true
  try {
    groups.value = await search(newQuery)
  } finally {
    pending.value = false
  }
})

function onOpen(value: boolean) {
  isOpen.value = value
  if (!value) searchTerm.value = ''
}
</script>

<template>
  <div>
    <UModal v-model:open="isOpen" @update:open="onOpen">
      <UButton
        :label="t('main.search.button_label')"
        color="neutral"
        variant="subtle"
        icon="i-lucide-search"
        @click="isOpen = true"
      />

      <template #content>
        <UCommandPalette
          v-model:search-term="searchTerm"
          :loading="pending"
          :groups="groups"
          :autoselect="false"
          :placeholder="t('main.search.placeholder')"
        >
          <template #empty-state>
            <div class="p-10 text-center text-sm text-muted">
              {{ t('main.search.no_results') }}
            </div>
          </template>
        </UCommandPalette>
      </template>
    </UModal>
  </div>
</template>
