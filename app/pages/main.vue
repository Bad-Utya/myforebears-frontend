<script setup lang="ts">
import CreateAccountSuggestion from "~/components/common/CreateAccountSuggestion.vue";
import CreateTreeSuggestion from "~/components/common/CreateTreeSuggestion.vue";
import SideBar from "~/components/common/SideBar.vue";
import InlineFeed from "~/components/common/inline/InlineFeed.vue";
import MainUserWelcome from "~/components/main/MainUserWelcome.vue";
import type DataDTO from "~/composables/scripts/api/dtos/DataDTO";
import sendListTreesRequest from "~/composables/scripts/familytree/listTrees";
import useUserDataHandler from "~/composables/scripts/storages/get/userDataHandler";
import type { ListTreesResponse } from "~/composables/scripts/familytree/dtos/responses/ListTreesResponse";
import showApiErrorToast from "~/composables/scripts/ui/showApiErrorToast";
import InlineUserFeed from "~/components/common/inline/InlineUserFeed.vue";

const {userData, pending, initialized, ensureLoaded} = useUserDataHandler();
const isGuest = computed(() => initialized.value && !pending.value && !userData.value);
const hasNoTrees = ref(false);

async function loadMyTreesState() {
  try {
    const response = await sendListTreesRequest() as DataDTO<ListTreesResponse>;
    const trees = Array.isArray(response.data?.trees) ? response.data.trees : [];
    hasNoTrees.value = trees.length === 0;
  } catch (error) {
    hasNoTrees.value = false;
    showApiErrorToast(error);
  }
}

onMounted(async () => {
  await ensureLoaded();

  if (userData.value) {
    await loadMyTreesState();
  }
});
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar activeTab="main"/>

    <UMain class="w-full p-4 lg:p-6">
      <UContainer class="">
        <div class="flex w-full items-start gap-4 flex-col lg:flex-row">
          <MainUserWelcome/>
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

        <CreateTreeSuggestion
          v-if="!isGuest && hasNoTrees"
          class="mt-6"
        />
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped>

</style>
