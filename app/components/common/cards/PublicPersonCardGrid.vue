<script setup lang="ts">
import PublicPersonCard from '~/components/common/cards/PublicPersonCard.vue'
import type { PublicPersonCardItem } from '~/utils/ui/publicPersons/mapPublicPersonToCardItem'

const props = withDefaults(defineProps<{
  items?: PublicPersonCardItem[]
  pending?: boolean
  limit?: number
}>(), {
  items: () => [],
  pending: false,
  limit: 12
})

const emit = defineEmits<{
  select: [item: PublicPersonCardItem]
}>()

const skeletonItems = computed<PublicPersonCardItem[]>(() => {
  return Array.from({ length: props.limit }, (_, index) => ({
    id: `skeleton-${index}`,
    person: {},
    fullName: '',
    avatarUrl: null
  }))
})

const cardItems = computed(() => props.pending ? skeletonItems.value : props.items)
const hasItems = computed(() => props.items.length > 0)
</script>

<template>
  <section>
    <div
      v-if="props.pending || hasItems"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    >
      <PublicPersonCard
        v-for="item in cardItems"
        :key="item.id"
        :pending="props.pending"
        :full-name="item.fullName"
        :birth-year="item.birthYear"
        :gender="item.gender"
        :biography="item.biography"
        :tags-text="item.tagsText"
        :avatar-url="item.avatarUrl"
        :seed="item.id"
        @click="!props.pending && emit('select', item)"
      />
    </div>

    <slot
      v-else
      name="fallback"
    />
  </section>
</template>
