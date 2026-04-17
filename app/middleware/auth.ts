import {getAccessToken, getAccessTokenRefreshed} from "~/composables/scripts/cookies/getAccessToken";

export default defineNuxtRouteMiddleware((to) => {
  const token = getAccessTokenRefreshed();

  if (!token.value) {
    return navigateTo('/login');
  }
})
