<script setup lang="ts">
</script>

<template>
  <div class="rounded-4xl border border-dashed border-default bg-elevated/40 p-8 text-center">
    <div class="mx-auto max-w-md space-y-4">
      <div class="mx-auto size-14 rounded-full bg-muted flex items-center justify-center">
        <UIcon name="i-lucide-network" class="size-7 text-muted" />
      </div>

      <div class="space-y-2">
        <h2 class="text-xl font-semibold">No trees yet</h2>
        <p class="text-sm text-muted">
          Create your first family tree to start filling this page.
        </p>
      </div>

      <div class="flex justify-center">
        <UButton color="neutral" variant="soft" icon="i-lucide-plus" to="/main">
          Create tree
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
