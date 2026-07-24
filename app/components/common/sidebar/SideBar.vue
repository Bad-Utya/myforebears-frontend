<script setup lang="ts">
import Logo from '~/components/common/Logo.vue'
import ProfileInfo from '~/components/common/sidebar/ProfileInfo.vue'
import SidebarButtonList, { type SidebarButtonListItem } from '~/components/common/sidebar/SidebarButtonList.vue'

const { t } = useI18n()
const route = useRoute()

const isShown = ref(true)
const isMobileOpen = ref(false)

type TabKey = 'feed' | 'trees' | 'main' | null

const props = defineProps<{
  activeTab: TabKey
}>()

function toggleVisibility() {
  isShown.value = !isShown.value
}

function closeMobileMenu() {
  isMobileOpen.value = false
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

watch(() => route.fullPath, () => {
  isMobileOpen.value = false
})
</script>

<template>
  <div
    v-if="isShown"
    class="hidden w-72 shrink-0 lg:block"
  />
  <div
    v-if="isShown"
    class="fixed hidden h-screen w-72 shrink-0 self-start flex-col gap-y-12 overflow-y-auto border-r border-sidebar-border bg-sidebar-bg p-4 lg:flex"
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
    class="fixed left-4 top-4 z-30 hidden lg:block"
  >
    <UButton
      icon="i-lucide-arrow-right"
      class="rounded-xl"
      color="neutral"
      variant="soft"
      @click="toggleVisibility"
    />
  </div>

  <div class="fixed inset-x-0 top-0 z-30 border-b border-sidebar-border bg-sidebar-bg/95 px-4 py-3 backdrop-blur lg:hidden">
    <div class="flex items-center justify-between gap-3">
      <Logo />
      <UButton
        icon="i-lucide-menu"
        color="neutral"
        variant="soft"
        class="rounded-xl"
        @click="isMobileOpen = true"
      />
    </div>
  </div>

  <USlideover
    v-model:open="isMobileOpen"
    side="left"
    :ui="{ content: 'bg-sidebar-bg w-72 max-w-[calc(100vw-1rem)]' }"
  >
    <template #header>
      <div class="flex w-full items-center justify-between gap-3">
        <Logo />
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          class="rounded-xl text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text"
          @click="closeMobileMenu"
        />
      </div>
    </template>

    <template #body>
      <div class="flex min-h-full flex-col gap-8 p-2">
        <SidebarButtonList
          :items="items"
          :active-key="props.activeTab ?? undefined"
          @select="closeMobileMenu"
        />

        <div @click="closeMobileMenu">
          <slot name="side" />
        </div>

        <ProfileInfo class="mt-auto" />
      </div>
    </template>
  </USlideover>
</template>
