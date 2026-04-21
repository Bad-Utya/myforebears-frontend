<script setup lang="ts">
import Logo from "~/components/common/Logo.vue";
import ProfileInfo from "~/components/app/ProfileInfo.vue";

let isShown = ref(true);

type TabKey = 'feed' | 'trees' | 'main' | null

const props = defineProps<{
  activeTab: TabKey
}>()

function toggleVisibility() {
  isShown.value = !isShown.value;
}

const items: { key: TabKey; label: string; icon: string, href: string }[] = [
  { key: 'main', label: 'Main', icon: 'i-lucide-compass', href: '/main' },
  { key: 'feed', label: 'Feed', icon: 'i-lucide-earth', href: '/feed' },
  { key: 'trees', label: 'My trees', icon: 'i-lucide-network', href: '/my' },
];
</script>

<template>
  <div class="h-screen w-fit flex flex-col gap-y-12 p-4 border-r border-default bg-neutral" v-if="isShown">
    <div class="w-full flex justify-between items-center">
      <Logo/>
      <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" class="rounded-xl"
               @click="toggleVisibility"></UButton>
    </div>

    <nav class="space-y-2">
      <UButton v-for="item in items"
               :ui="{leadingIcon: 'text-neutral mr-2'}"
               :icon="item.icon"
               :to="item.href"
               color="neutral"
               :variant="activeTab === item.key ? 'soft' : 'ghost'"
               class="w-full font-light py-4"
               :class="props.activeTab === item.key
               ? 'bg-accented text-highlighted'
               : 'text-neutral hover:bg-muted hover:text-highlighted'
        "
               :label="item.label"/>
    </nav>

    <slot name="side"/>

    <ProfileInfo class="mt-auto"/>
  </div>
  <div v-else class="absolute">
    <UButton icon="i-lucide-arrow-right" class="m-4 rounded-xl" color="neutral" variant="soft" @click="toggleVisibility"/>
  </div>
</template>

<style scoped>

</style>
