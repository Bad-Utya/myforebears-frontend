import {getAccessTokenRefreshed} from "~/utils/scripts/cookies/getAccessToken";

export default defineNuxtRouteMiddleware(async () => {
  await getAccessTokenRefreshed();
});
