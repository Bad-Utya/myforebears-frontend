<script setup lang="ts">
const password = defineModel<string>();
const showPassword = ref(false);

function toggleShowButton() {
  showPassword.value = !showPassword.value;
}

</script>

<template>
  <div class="flex flex-row gap-2">
    <UInput v-model="password" color="neutral" variant="subtle" placeholder="Password" class="w-full"
            :type="showPassword ? 'text' : 'password'"
    ></UInput>
    <UButton variant="subtle"
             :icon="showPassword ? 'i-lucide-eye' : 'i-lucide-eye-closed'"
             :color="showPassword ? 'primary' : 'neutral'"
             @click="toggleShowButton()"/>
  </div>
</template>

<style scoped>

</style>
