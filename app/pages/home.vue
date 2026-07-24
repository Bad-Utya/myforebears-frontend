<script setup lang="ts">
import useAppPreferencesHandler from '~/utils/scripts/storages/get/appPreferencesHandler'
import useUserDataHandler from "~/utils/scripts/storages/get/userDataHandler";

const { t } = useI18n()
const { userData, pending, initialized, ensureLoaded } = useUserDataHandler()

const colorMode = useColorMode()
const {
  preferences,
  updatePreferences,
  switchTheme
} = useAppPreferencesHandler()

const isRussianLanguage = computed({
  get: () => preferences.value.language === 'ru',
  set: (value: boolean) => updatePreferences({ language: value ? 'ru' : 'en' })
})

onMounted(async () => {
  await ensureLoaded()
})
</script>

<template>
  <header class="border-b border-default">
    <UContainer class="flex items-center justify-between gap-3 py-4">
      <NuxtLink to="/home" class="text-lg font-semibold tracking-wide text-highlighted">
        Rooots
      </NuxtLink>

      <div class="flex items-center justify-end gap-2">
        <UButton
          class="hidden sm:inline-flex"
          color="neutral"
          variant="subtle"
          to="/main"
        >
          {{ t('landing.header.open_app') }}
        </UButton>

        <UButton
          class="sm:hidden"
          color="neutral"
          variant="subtle"
          to="/main"
          icon="i-lucide-arrow-up-right"
          aria-label="Open app"
        />

        <UPopover :popper="{ placement: 'bottom-end' }">
          <UButton
            color="neutral"
            variant="subtle"
            icon="i-lucide-settings"
            aria-label="Settings"
          />

          <template #content>
            <div class="p-4 w-48 flex flex-col gap-4">
              <div class="flex items-center justify-between gap-4">
                <span class="text-sm font-medium text-toned">
                  {{ colorMode.value === 'dark' ? t('landing.header.dark_mode') : t('landing.header.light_mode') }}
                </span>
                <UColorModeSwitch
                  size="md"
                  color="primary"
                  @click="switchTheme"
                />
              </div>

              <UDivider />

              <div class="flex items-center justify-between gap-4">
                <span class="text-sm font-medium text-toned">
                  {{ preferences.language === 'ru' ? 'Русский' : 'English' }}
                </span>
                <USwitch
                  v-model="isRussianLanguage"
                  size="md"
                  color="primary"
                  checked-icon="i-lucide-languages"
                  unchecked-icon="i-lucide-languages"
                />
              </div>
            </div>
          </template>
        </UPopover>
      </div>
    </UContainer>
  </header>

  <UMain>
    <UPageHero
      class="bg-accented"
      :title="t('landing.hero.title')"
      :description="t('landing.hero.description')"
    >
      <template #links>
        <div class="flex flex-row items-center justify-center gap-2">
          <UButton
            size="lg"
            color="neutral"
            variant="soft"
            to="/auth/login"
          >
            {{ t('landing.hero.login') }}
          </UButton>
          <UButton
            size="lg"
            color="primary"
            variant="solid"
            to="/auth/register"
          >
            {{ t('landing.hero.register') }}
          </UButton>
        </div>
      </template>
    </UPageHero>

    <!-- Секция преимуществ -->
    <section class="border-t border-default">
      <UContainer class="py-16 sm:py-24">
        <div class="flex flex-col gap-12">
          <div class="space-y-6">
            <p class="text-sm font-medium uppercase tracking-[0.16em] text-primary">
              {{ t('landing.features.overline') }}
            </p>
            <h2 class="max-w-4xl text-3xl font-semibold text-highlighted sm:text-5xl">
              {{ t('landing.features.main_title') }}
            </h2>
            <p class="max-w-4xl text-lg leading-8 text-toned">
              {{ t('landing.features.main_description') }}
            </p>
          </div>

          <!-- Карточки -->
          <div class="flex flex-col gap-8 md:flex-row">
            <div class="max-w-md rounded-2xl border border-default bg-card-bg p-6 sm:p-8">
              <p class="text-xl font-semibold text-highlighted">
                {{ t('landing.features.card_worldbuilding_title') }}
              </p>
              <p class="mt-3 text-base leading-7 text-muted">
                {{ t('landing.features.card_worldbuilding_desc') }}
              </p>
            </div>

            <div class="max-w-md rounded-2xl border border-default bg-card-bg p-6 sm:p-8">
              <p class="text-xl font-semibold text-highlighted">
                {{ t('landing.features.card_scale_title') }}
              </p>
              <p class="mt-3 text-base leading-7 text-muted">
                {{ t('landing.features.card_scale_desc') }}
              </p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>
  </UMain>

  <UFooter class="border-t border-default bg-sidebar-bg">
    <template #left>
      <p class="text-sm">
        {{ t('landing.footer.rights') }}
      </p>
    </template>

    <template #right>
      <UButton variant="link" color="neutral" to="mailto:rooots.help@gmail.com">
        rooots.help@gmail.com
      </UButton>
    </template>
  </UFooter>
</template>
