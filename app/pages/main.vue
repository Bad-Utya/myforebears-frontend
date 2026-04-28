<script setup lang="ts">
import CreateAccountSuggestion from "~/components/common/CreateAccountSuggestion.vue";
import SideBar from "~/components/common/SideBar.vue";
import TreeSearchFast from "~/components/main/TreeSearchFast.vue";
import InlineFeed from "~/components/common/inline/InlineFeed.vue";
import MainUserWelcome from "~/components/main/MainUserWelcome.vue";
import useUserDataHandler from "~/composables/scripts/storages/get/userDataHandler";
import InlineUserFeed from "~/components/common/inline/InlineUserFeed.vue";

definePageMeta({middleware: 'auth'})

const {userData, pending, initialized, ensureLoaded} = useUserDataHandler();
const isGuest = computed(() => initialized.value && !pending.value && !userData.value);

onMounted(async () => {
  await ensureLoaded();
});
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar activeTab="main"/>

    <UMain class="w-full p-4 lg:p-6">
      <UContainer class="">
        <div class="flex w-full items-start gap-4 flex-col lg:flex-row">
          <MainUserWelcome/>
          <TreeSearchFast class="ml-auto"/>
        </div>

        <CreateAccountSuggestion
          v-if="isGuest"
          class="mt-6"
          title="Build your family tree with an account"
          description="Register to save your progress, keep your profile in sync, and start creating trees."
          button-label="Create account"
        />


        <InlineFeed title="Trees for you" :limit="10">
          <!--todo refacttor add a fallback slot-->
          <!--          <template slot="fallback">-->
          <!--          <p class="py-12 text-center text-sm text-muted">-->
          <!--            Trees matching the selected parameters were not found.-->
          <!--          </p>-->
          <!--          </template>-->
        </InlineFeed>

        <InlineUserFeed title="Recommended users" :limit="10"/>
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped>

</style>
