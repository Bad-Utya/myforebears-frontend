<script setup lang="ts">

</script>

<template>
      <UHeader title="Rooots">
        <template #right>
          <UButton color="neutral" variant="ghost" to="/auth/login">Login</UButton>
          <UButton color="primary" variant="solid" to="/auth/register">Register</UButton>
        </template>
      </UHeader>
      <UMain>
        <UPageHero title="Whole worlds described by genealogical trees" description="Unique project about genealogical trees"></UPageHero>
      </UMain>
      <UFooter>
        <template #left>
          <p class="text-sm">All rights reserved</p>
        </template>

        <template #right>
          <UButton variant="link">Contact us</UButton>
        </template>
      </UFooter>
</template>

<style scoped>
</style>
