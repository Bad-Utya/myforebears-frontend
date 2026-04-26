<script setup lang="ts">
import SideBar from "~/components/common/SideBar.vue";
import TreeSearchFast from "~/components/main/TreeSearchFast.vue";
import InlineFeed from "~/components/common/inline/InlineFeed.vue";
import MainUserWelcome from "~/components/main/MainUserWelcome.vue";

definePageMeta({ middleware: 'auth' })
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar activeTab="main"/>

    <UMain class="w-full p-4 lg:p-6">
      <UContainer class="">
        <div class="flex w-full items-start gap-4">
          <MainUserWelcome />
          <TreeSearchFast class="ml-auto"/>
        </div>

        <InlineFeed title="For you" :limit="10" />
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped>

</style>
