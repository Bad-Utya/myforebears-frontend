import {getAccessToken} from "~/composables/scripts/cookies/getAccessToken";

export default defineNuxtRouteMiddleware((to) => {
  const token = getAccessToken();

  if (!token.value) {
    return navigateTo('/home');
  }

  return navigateTo('/app');
})
