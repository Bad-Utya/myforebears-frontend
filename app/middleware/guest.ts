import {getAccessTokenRefreshed} from "~/utils/scripts/cookies/getAccessToken";

export default defineNuxtRouteMiddleware(async () => {
  const token = await getAccessTokenRefreshed();

  if (token) {
    return navigateTo('/main');
  }
});
