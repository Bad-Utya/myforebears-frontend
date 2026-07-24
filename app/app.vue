<script setup lang="ts">
import useAppPreferencesHandler from '~/utils/scripts/storages/get/appPreferencesHandler'

const {preferences} = useAppPreferencesHandler()
const colorMode = useColorMode()

const { setLocale, locale } = useI18n()

watch(() => preferences.value.theme, (newTheme) => {
  if (colorMode.preference !== newTheme) {
    colorMode.preference = newTheme
  }
}, {immediate: true})

watch(() => preferences.value.language, (newLang) => {
  if (locale.value !== newLang) {
    setLocale(newLang)
  }
}, {immediate: true})

</script>
<template>
  <UApp>
    <NuxtPage/>
  </UApp>
</template>

<style scoped>

</style>
