<script setup lang="ts">
import { watch } from 'vue'

const { t } = useI18n()

const email = defineModel<string>('data')

</script>

<template>
  <div class="relative">
    <UInput
      v-model="email"
      :placeholder="t('main.search.button_label')"
      variant="subtle"
      color="primary"
      size="md"
      icon="i-lucide-search"
    />
  </div>
</template>
