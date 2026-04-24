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

        </div>

        <InlineFeed/>
        <InlineFeed/>
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped>

</style>
