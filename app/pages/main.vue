<script setup lang="ts">

import SideBar from "~/components/common/SideBar.vue";
import TreeSearchFast from "~/components/main/TreeSearchFast.vue";
import InlineFeed from "~/components/common/InlineFeed.vue";
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar activeTab="main"/>

    <UMain class="w-full flex p-4">
      <UContainer class="">
        <div class="flex w-full">
          <div class="space-y-2">
            <p class="text-left text-md text-muted">Welcome back,</p>
            <div class="flex gap-2 items-center">
              <UAvatar class="size-6"/>
              <p class="text-left text-xl font-semibold">BananaBoy76</p>
            </div>
          </div>
          <TreeSearchFast class="ml-auto"/>
        </div>

        <InlineFeed/>
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped>

</style>
