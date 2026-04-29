<script setup lang="ts">
import useAppPreferencesHandler from '~/composables/scripts/storages/get/appPreferencesHandler'

const colorMode = useColorMode()
const { language, ensureLoaded, setLanguage } = useAppPreferencesHandler()
const isRussianLanguage = computed({
  get: () => language.value === 'ru',
  set: (value: boolean) => setLanguage(value ? 'ru' : 'en')
})

onMounted(() => {
  ensureLoaded()
})
</script>

<template>
  <UHeader title="Rooots">
    <template #right>
      <div class="flex items-center gap-3">
        <UButton color="neutral" variant="subtle" to="/main">Open app</UButton>

        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-muted">
              {{ colorMode.value === 'dark' ? 'Dark' : 'Light' }}
            </span>

            <UColorModeSwitch
              class="ml-auto"
              size="md"
              color="primary"
            />
          </div>

          <div class="flex items-center gap-2 width-max">
            <span class="text-sm font-medium text-muted">
              {{ language === 'ru' ? 'RU' : 'EN' }}
            </span>

            <USwitch
              class="ml-auto"
              v-model="isRussianLanguage"
              size="md"
              color="primary"
              checked-icon="i-lucide-languages"
              unchecked-icon="i-lucide-languages"
              aria-label="Toggle language"
            />
          </div>
        </div>

      </div>
    </template>
  </UHeader>

  <UMain>
    <UPageHero
      title="Whole worlds described by genealogical trees"
      description="Build lineages for families, dynasties, pantheons, invented houses, and entire fictional worlds."
    >
      <template #links>
        <UButton
          size="xl"
          color="neutral"
          variant="subtle"
          to="/auth/login"
        >
          Login
        </UButton>
        <UButton
          size="xl"
          color="primary"
          variant="solid"
          to="/auth/register"
        >
          Register
        </UButton>
      </template>
    </UPageHero>

    <section class="border-t border-default">
      <UContainer class="py-12 sm:py-16">
        <div class="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-12">
          <div class="space-y-5">
            <p class="text-sm font-medium uppercase tracking-[0.16em] text-primary">
              Beyond family archives
            </p>
            <h2 class="max-w-3xl text-3xl font-semibold text-highlighted sm:text-4xl">
              Rooots is built for mythologies, dynasties, fandom canons, and worlds that never fit inside ordinary family tree tools.
            </h2>
            <p class="max-w-3xl text-base leading-7 text-toned">
              Map royal succession, divine ancestry, rival bloodlines, hidden heirs, marriage politics, and branches of entire fictional civilizations in one place. Whether you are documenting a fantasy empire, a tabletop campaign setting, a legendary house, or your own long-form worldbuilding project, the structure stays readable even when the lore gets dense.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div class="rounded-xl border border-default bg-card-bg p-5">
              <p class="text-sm font-semibold text-highlighted">
                Worldbuilding-first
              </p>
              <p class="mt-2 text-sm leading-6 text-muted">
                Track invented lineages, sacred genealogies, cadet branches, mythic founders, and power transitions without pretending every tree is a modern household.
              </p>
            </div>

            <div class="rounded-xl border border-default bg-card-bg p-5">
              <p class="text-sm font-semibold text-highlighted">
                Built for lore at scale
              </p>
              <p class="mt-2 text-sm leading-6 text-muted">
                Organize complex relationship webs for houses, clans, pantheons, and alternate histories with a layout that stays legible as your canon expands.
              </p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>
  </UMain>

  <UFooter class="border-t border-default bg-sidebar-bg">
    <template #left>
      <p class="text-sm">All rights reserved</p>
    </template>

    <template #right>
      <UButton variant="link">rooots.help@gmail.com</UButton>
    </template>
  </UFooter>
</template>

<style scoped>
</style>
