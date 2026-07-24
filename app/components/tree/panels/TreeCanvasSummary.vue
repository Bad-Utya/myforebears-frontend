<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  pending?: boolean
  treeName: string
  treeDescription?: string
  treeAuthorName?: string
  treeAuthorHref?: string
}>()
</script>

<template>
  <div class="absolute left-4 top-4 z-10 border border-default rounded-2xl bg-neutral p-4 backdrop-blur-lg max-w-72 select-none">
    <div
      v-if="pending"
      class="flex flex-col gap-2"
    >
      <USkeleton class="h-5 w-40 rounded" />
      <USkeleton class="h-4 w-28 rounded" />
    </div>

    <template v-else>
      <p class="text-md font-semibold text-highlighted truncate">
        {{ treeName }}
      </p>

      <p
        v-if="treeDescription?.trim()"
        class="mt-2 line-clamp-3 text-sm text-toned"
      >
        {{ treeDescription }}
      </p>

      <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted">
        <span>{{ t('tree.info_card.by') }}</span>

        <NuxtLink
          v-if="treeAuthorHref"
          :to="treeAuthorHref"
          class="font-medium text-primary hover:text-primary/80 truncate"
        >
          {{ treeAuthorName || t('tree.info_card.unknown_author') }}
        </NuxtLink>

        <span
          v-else
          class="font-medium text-highlighted"
        >
          {{ treeAuthorName || t('tree.info_card.unknown_author') }}
        </span>
      </div>
    </template>
  </div>
</template>
