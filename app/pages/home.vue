<script setup lang="ts">

</script>

<template>
    <UApp>
      <UHeader title="Rooots">
        <template #right>
          <UButton color="neutral" variant="outline" to="/auth/login">Login</UButton>
          <UButton color="primary" variant="solid" to="/auth/register">Register</UButton>
        </template>
      </UHeader>
      <UMain class="flex">
        <h1 class="m-auto text-center text-9xl font-bold">Whole new world of genealogical trees</h1>
      </UMain>
      <UFooter>
        <template #left>
          <p class="text-sm">All rights reserved</p>
        </template>

        <template #right>
          <UButton variant="link">Contact us</UButton>
        </template>
      </UFooter>
    </UApp>
</template>

<style scoped>
</style>
