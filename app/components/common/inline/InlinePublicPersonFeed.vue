<script setup lang="ts">
import PublicPersonModal from '~/components/publicPersons/PublicPersonModal.vue'
import PublicPersonCardCompact from '~/components/common/cards/PublicPersonCardCompact.vue'
import type DataDTO from '~/services/api/dtos/DataDTO'
import type { ListPublicPersonsResponse } from '~/services/publicPersons/dtos/responses/ListPublicPersonsResponse'
import sendListRandomPublicPersonsRequest from '~/services/publicPersons/listRandomPublicPersons'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import {
  loadPublicPersonCardItems,
  revokePublicPersonCardItems
} from '~/utils/ui/publicPersons/loadPublicPersonCardItems'
import type { PublicPersonCardItem } from '~/utils/ui/publicPersons/mapPublicPersonToCardItem'

type PublicPersonCarouselItem = PublicPersonCardItem & {
  isSkeleton?: boolean
}

const props = withDefaults(defineProps<{
  title?: string
  limit?: number
}>(), {
  title: '',
  limit: 10
})

const displayTitle = computed(() => props.title || '')
const pending = ref(true)
const items = ref<PublicPersonCardItem[]>([])
const selectedItem = ref<PublicPersonCardItem | null>(null)
const isModalOpen = ref(false)

const skeletonItems = computed<PublicPersonCarouselItem[]>(() => (
  Array.from({ length: props.limit }, (_, index) => ({
    id: `skeleton-${index}`,
    person: {},
    fullName: '',
    avatarUrl: null,
    isSkeleton: true
  }))
))
const carouselItems = computed<PublicPersonCarouselItem[]>(() => (
  pending.value ? skeletonItems.value : items.value
))

function replaceItems(nextItems: PublicPersonCardItem[]) {
  revokePublicPersonCardItems(items.value)
  items.value = nextItems
}

function openItem(item: PublicPersonCardItem) {
  selectedItem.value = item
  isModalOpen.value = true
}

async function loadItems() {
  pending.value = true

  try {
    const response = await sendListRandomPublicPersonsRequest(props.limit) as DataDTO<ListPublicPersonsResponse>
    const persons = Array.isArray(response.data?.persons) ? response.data.persons : []
    replaceItems(await loadPublicPersonCardItems(persons))
  } catch (error) {
    showApiErrorToast(error)
    replaceItems([])
  } finally {
    pending.value = false
  }
}

onMounted(async () => {
  await loadItems()
})

onBeforeUnmount(() => {
  revokePublicPersonCardItems(items.value)
})
</script>

<template>
  <section class="py-4">
    <div class="mb-4 flex items-center justify-between gap-3">
      <h1 class="text-left text-md font-semibold text-neutral">
        {{ displayTitle }}
      </h1>
    </div>

    <UCarousel
      v-if="pending || carouselItems.length > 0"
      :items="carouselItems"
      arrows
      :loop="false"
      :ui="{
        viewport: 'overflow-hidden',
        item: 'basis-[84%] shrink-0 sm:basis-sm'
      }"
      :prev="{ variant: 'subtle', color: 'neutral', class: 'rounded-full backdrop-blur disabled:hidden' }"
      :next="{ variant: 'subtle', color: 'neutral', class: 'rounded-full backdrop-blur disabled:hidden' }"
    >
      <template #default="{ item }">
        <PublicPersonCardCompact
          :pending="item.isSkeleton === true"
          :full-name="item.fullName"
          :birth-year="item.birthYear"
          :gender="item.gender"
          :biography="item.biography"
          :tags-text="item.tagsText"
          :avatar-url="item.avatarUrl"
          @click="!item.isSkeleton && openItem(item)"
        />
      </template>
    </UCarousel>

    <slot
      v-else
      name="fallback"
    />

    <PublicPersonModal
      v-model:open="isModalOpen"
      :person="selectedItem?.person ?? null"
      @updated="loadItems"
      @deleted="loadItems"
    />
  </section>
</template>
