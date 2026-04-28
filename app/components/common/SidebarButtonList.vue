<script setup lang="ts" generic="T extends string | number">
export type SidebarButtonListItem<TItem extends string | number = string> = {
  key: TItem
  label: string
  icon: string
  href?: string
  disabled?: boolean
}

const props = defineProps<{
  items: SidebarButtonListItem<T>[]
  activeKey?: T | null
}>()

const emit = defineEmits<{
  select: [key: T]
}>()

function handleSelect(item: SidebarButtonListItem<T>) {
  if (item.href) {
    return
  }

  emit('select', item.key)
}
</script>

<template>
  <nav class="space-y-2">
    <UButton
      v-for="item in props.items"
      :key="String(item.key)"
      :ui="{ leadingIcon: 'text-neutral mr-2' }"
      :icon="item.icon"
      :to="item.href"
      color="neutral"
      :variant="activeKey === item.key ? 'soft' : 'ghost'"
      class="w-full px-4 py-4 text-left font-light"
      :class="activeKey === item.key
        ? 'bg-accented text-highlighted'
        : 'text-neutral hover:bg-muted hover:text-highlighted'"
      :label="item.label"
      :disabled="item.disabled"
      @click="handleSelect(item)"
    />
  </nav>
</template>
