<script setup lang="ts">
import Logo from '~/components/common/Logo.vue'
import ProfileInfo from '~/components/common/sidebar/ProfileInfo.vue'
import SidebarButtonList, { type SidebarButtonListItem } from '~/components/common/sidebar/SidebarButtonList.vue'

const { t } = useI18n()

const isShown = ref(true)

type TabKey = 'feed' | 'trees' | 'main' | null

const props = defineProps<{
  activeTab: TabKey
}>()

function toggleVisibility() {
  isShown.value = !isShown.value
}

const items = computed<SidebarButtonListItem<Exclude<TabKey, null>>[]>(() => [
  {
    key: 'main',
    label: t('common.navigation.main'),
    icon: 'i-lucide-compass',
    href: '/main'
  },
  {
    key: 'feed',
    label: t('common.navigation.feed'),
    icon: 'i-lucide-earth',
    href: '/feed'
  },
  {
    key: 'trees',
    label: t('common.navigation.my_trees'),
    icon: 'i-lucide-network',
    href: '/my'
  }
])
</script>

<template>
  <!-- TODO: Kostyl -->
  <div
    v-if="isShown"
    class="shrink-0 w-72"
  />
  <div
    v-if="isShown"
    class="fixed flex p-4 h-screen w-72 shrink-0 self-start flex-col gap-y-12 overflow-y-auto border-r border-sidebar-border bg-sidebar-bg"
  >
    <div class="flex w-full items-center justify-between">
      <Logo />
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        class="rounded-xl text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text"
        @click="toggleVisibility"
      />
    </div>

    <SidebarButtonList
      :items="items"
      :active-key="props.activeTab ?? undefined"
    />

    <slot name="side" />

    <ProfileInfo class="mt-auto" />
  </div>

  <div
    v-else
    class="fixed left-4 top-4 z-30"
  >
    <UButton
      icon="i-lucide-arrow-right"
      class="rounded-xl"
      color="neutral"
      variant="soft"
      @click="toggleVisibility"
    />
  </div>
</template>
