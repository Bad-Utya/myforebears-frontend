<script setup lang="ts">
</script>

<template>
  <UMain class="flex">
    <div class="flex flex-col gap-4 m-auto w-lg h-auto">
      <UButton color="neutral" variant="link" icon="i-lucide-arrow-left" class="w-fit cursor-pointer" @click="$router.back()">
        Back
      </UButton>

      <div class="flex flex-col gap-4 m-auto w-lg h-auto p-4 rounded-xl shadow-lg shadow-carbon-800">
        <div>
          <h1 class="text-left text-3xl font-bold">Settings</h1>
          <p class="text-left text-md text-muted max-w-md">Manage your profile and application preferences</p>
        </div>
      </div>
    </div>
  </UMain>
</template>

<style scoped>

</style>
