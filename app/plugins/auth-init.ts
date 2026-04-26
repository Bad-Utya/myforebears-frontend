import {getAccessToken, getRefreshToken, refreshAccessToken} from "~/composables/scripts/cookies/getAccessToken";

export default defineNuxtPlugin(async () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (accessToken.value || !refreshToken.value) {
    return;
  }

  await refreshAccessToken();
});
