<script setup lang="ts">
import type { MainSearchTreeItem, MainSearchUserItem } from '~/composables/main/useSearchTreeFast'
import { useSearchTreeFast } from '~/composables/main/useSearchTreeFast'
import type { PublicPersonCardItem } from '~/utils/ui/publicPersons/mapPublicPersonToCardItem'
import { normalizePublicPersonGender } from '~/utils/ui/publicPersons/publicPersonHelpers'
import PublicPersonModal from '~/components/publicPersons/PublicPersonModal.vue'
import useUserDataHandler from '~/utils/scripts/storages/get/userDataHandler'

const { t } = useI18n()
const { ensureLoaded } = useUserDataHandler()
const { search } = useSearchTreeFast()

const isOpen = ref(false)
const searchTerm = ref('')
const pending = ref(false)
const trees = ref<MainSearchTreeItem[]>([])
const users = ref<MainSearchUserItem[]>([])
const persons = ref<PublicPersonCardItem[]>([])
const selectedPublicPerson = ref<PublicPersonCardItem | null>(null)
const isPublicPersonModalOpen = ref(false)
let searchRequestId = 0

const hasResults = computed(() => {
  return trees.value.length > 0 || users.value.length > 0 || persons.value.length > 0
})

async function openSearch() {
  await ensureLoaded()
  isOpen.value = true
}

function resetState() {
  searchTerm.value = ''
  trees.value = []
  users.value = []
  persons.value = []
  pending.value = false
}

function onOpen(value: boolean) {
  isOpen.value = value

  if (!value) {
    resetState()
  }
}

function openPublicPerson(item: PublicPersonCardItem) {
  selectedPublicPerson.value = item
  isPublicPersonModalOpen.value = true
}

function getPersonMetaText(item: PublicPersonCardItem) {
  const parts: string[] = []
  const normalizedGender = normalizePublicPersonGender(item.gender)

  if (normalizedGender === 'MALE') {
    parts.push(t('public_persons.genders.male'))
  } else if (normalizedGender === 'FEMALE') {
    parts.push(t('public_persons.genders.female'))
  }

  if (item.birthYear) {
    parts.push(item.birthYear)
  }

  if (item.tagsText) {
    parts.push(item.tagsText)
  }

  return parts.join(' · ')
}

async function runSearch() {
  const query = searchTerm.value.trim()
  const requestId = ++searchRequestId

  if (query.length < 2) {
    trees.value = []
    users.value = []
    persons.value = []
    return
  }

  pending.value = true

  try {
    const result = await search(query)

    if (requestId !== searchRequestId) {
      return
    }

    trees.value = result.trees
    users.value = result.users
    persons.value = result.persons
  } finally {
    if (requestId === searchRequestId) {
      pending.value = false
    }
  }
}

watch(searchTerm, () => {
  void runSearch()
})
</script>

<template>
  <div class="w-full lg:w-auto">
    <UModal
      v-model:open="isOpen"
      :title="t('main.search.title')"
      :description="t('main.search.description')"
      :ui="{ content: 'bg-default flex max-h-[90dvh] flex-col overflow-hidden sm:max-w-xl' }"
      @update:open="onOpen"
    >
      <UButton
        :label="t('main.search.button_label')"
        color="neutral"
        variant="subtle"
        icon="i-lucide-search"
        class="w-full justify-center lg:w-auto"
        @click="openSearch"
      />

      <template #body>
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <UInput
              v-model="searchTerm"
              class="flex-1"
              icon="i-lucide-search"
              color="primary"
              variant="subtle"
              :placeholder="t('main.search.placeholder')"
            />
          </div>

          <div class="max-h-[55dvh] space-y-5 overflow-y-auto pr-1">
            <div
              v-if="searchTerm.trim().length < 2"
              class="py-10 text-center text-sm text-muted"
            >
              {{ t('main.search.start_typing') }}
            </div>

            <div
              v-else-if="pending"
              class="py-10 text-center text-sm text-muted"
            >
              {{ t('main.search.loading') }}
            </div>

            <template v-else-if="hasResults">
              <section
                v-if="users.length"
                class="space-y-2"
              >
                <p class="text-xs font-semibold uppercase tracking-wider text-muted">
                  {{ t('main.search.groups.users') }}
                </p>

                <NuxtLink
                  v-for="item in users"
                  :key="item.id"
                  :to="item.href"
                  class="block rounded-2xl border border-default px-4 py-3 transition-colors hover:bg-elevated"
                  @click="isOpen = false"
                >
                  <p class="truncate text-sm font-semibold text-highlighted">
                    {{ item.title }}
                  </p>
                  <p
                    v-if="item.description"
                    class="truncate text-xs text-muted"
                  >
                    {{ item.description }}
                  </p>
                </NuxtLink>
              </section>

              <section
                v-if="trees.length"
                class="space-y-2"
              >
                <p class="text-xs font-semibold uppercase tracking-wider text-muted">
                  {{ t('main.search.groups.trees') }}
                </p>

                <NuxtLink
                  v-for="item in trees"
                  :key="item.id"
                  :to="item.href"
                  class="block rounded-2xl border border-default px-4 py-3 transition-colors hover:bg-elevated"
                  @click="isOpen = false"
                >
                  <p class="truncate text-sm font-semibold text-highlighted">
                    {{ item.title }}
                  </p>
                  <p
                    v-if="item.description"
                    class="line-clamp-1 text-xs text-muted"
                  >
                    {{ item.description }}
                  </p>
                </NuxtLink>
              </section>

              <section
                v-if="persons.length"
                class="space-y-2"
              >
                <p class="text-xs font-semibold uppercase tracking-wider text-muted">
                  {{ t('main.search.groups.persons') }}
                </p>

                <button
                  v-for="item in persons"
                  :key="item.id"
                  type="button"
                  class="block w-full rounded-2xl border border-default px-4 py-3 text-left transition-colors hover:bg-elevated"
                  @click="openPublicPerson(item)"
                >
                  <p class="truncate text-sm font-semibold text-highlighted">
                    {{ item.fullName }}
                  </p>
                  <p
                    v-if="getPersonMetaText(item)"
                    class="line-clamp-1 text-xs text-muted"
                  >
                    {{ getPersonMetaText(item) }}
                  </p>
                </button>
              </section>
            </template>

            <div
              v-else
              class="py-10 text-center text-sm text-muted"
            >
              {{ t('main.search.no_results') }}
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <PublicPersonModal
      v-model:open="isPublicPersonModalOpen"
      :person="selectedPublicPerson?.person ?? null"
      @updated="void runSearch()"
      @deleted="void runSearch()"
    />
  </div>
</template>
