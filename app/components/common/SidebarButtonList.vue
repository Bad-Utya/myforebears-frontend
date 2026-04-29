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
      :ui="{ leadingIcon: activeKey === item.key ? 'mr-2 text-white/72' : 'mr-2 text-white/60' }"
      :icon="item.icon"
      :to="item.href"
      color="neutral"
      :variant="activeKey === item.key ? 'soft' : 'ghost'"
      class="w-full rounded-2xl px-4 py-4 text-left font-light"
      :class="activeKey === item.key
        ? 'bg-[var(--sidebar-active)] text-white hover:bg-[var(--sidebar-active-hover)]'
        : 'text-white/78 hover:bg-[var(--sidebar-hover)] hover:text-white'"
      :label="item.label"
      :disabled="item.disabled"
      @click="handleSelect(item)"
    />
  </nav>
</template>
