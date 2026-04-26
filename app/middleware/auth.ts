import {getAccessTokenRefreshed} from "~/composables/scripts/cookies/getAccessToken";

export default defineNuxtRouteMiddleware(async () => {
  await getAccessTokenRefreshed();
});
