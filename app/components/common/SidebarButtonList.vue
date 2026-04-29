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
      :ui="{ leadingIcon: activeKey === item.key ? 'mr-2 text-[var(--color-sidebar-selected-icon)]' : 'mr-2 text-[var(--color-sidebar-text-muted)]' }"
      :icon="item.icon"
      :to="item.href"
      color="neutral"
      :variant="activeKey === item.key ? 'soft' : 'ghost'"
      class="w-full rounded-2xl px-4 py-4 text-left font-light"
      :class="activeKey === item.key
        ? 'bg-[var(--color-sidebar-selected-bg)] text-[var(--color-sidebar-selected-text)] ring-1 ring-inset ring-[var(--color-sidebar-selected-border)] hover:bg-[var(--color-sidebar-selected-hover)]'
        : 'text-[var(--color-sidebar-idle-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-idle-hover-text)]'"
      :label="item.label"
      :disabled="item.disabled"
      @click="handleSelect(item)"
    />
  </nav>
</template>
