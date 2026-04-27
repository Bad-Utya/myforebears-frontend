<script setup lang="ts">
import Logo from '~/components/common/Logo.vue'
import ProfileInfo from '~/components/common/ProfileInfo.vue'
import SidebarButtonList, { type SidebarButtonListItem } from '~/components/common/SidebarButtonList.vue'

let isShown = ref(true)

type TabKey = 'feed' | 'trees' | 'main' | null

const props = defineProps<{
  activeTab: TabKey
}>()

function toggleVisibility() {
  isShown.value = !isShown.value
}

const items: SidebarButtonListItem<Exclude<TabKey, null>>[] = [
  { key: 'main', label: 'Main', icon: 'i-lucide-compass', href: '/main' },
  { key: 'feed', label: 'Feed', icon: 'i-lucide-earth', href: '/feed' },
  { key: 'trees', label: 'My trees', icon: 'i-lucide-network', href: '/my' }
]
</script>

<template>
  <div v-if="isShown" class="flex h-screen w-fit flex-col gap-y-12 border-r border-default bg-neutral p-4">
    <div class="flex w-full items-center justify-between">
      <Logo />
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        class="rounded-xl"
        @click="toggleVisibility"
      />
    </div>

    <SidebarButtonList :items="items" :active-key="props.activeTab ?? undefined" />

    <slot name="side" />

    <ProfileInfo class="mt-auto" />
  </div>

  <div v-else class="absolute">
    <UButton
      icon="i-lucide-arrow-right"
      class="m-4 rounded-xl"
      color="neutral"
      variant="soft"
      @click="toggleVisibility"
    />
  </div>
</template>
