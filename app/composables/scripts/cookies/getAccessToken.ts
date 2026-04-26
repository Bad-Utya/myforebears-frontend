import sendRefreshRequest from "~/composables/scripts/auth/refreshTokens";
import {useAuthTokensStore} from "~/composables/scripts/storages/create/authTokens";

export type StoredAuthTokens = {
  access_token?: string | null;
  refresh_token?: string | null;
};

let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken() {
  const tokens = useAuthTokensStore();
  return computed(() => tokens.accessToken);
}

export function getRefreshToken() {
  const refreshTokenCookie = useCookie<string | null>('refresh_token');
  console.log(refreshTokenCookie.value);
  return computed(() => refreshTokenCookie.value ?? null);
}

export function persistAuthTokens(tokens: StoredAuthTokens) {
  const authTokensStore = useAuthTokensStore();
  const refreshTokenCookie = useCookie<string | null>('refresh_token');

  authTokensStore.setAccessToken(tokens.access_token ?? null);

  if (tokens.refresh_token !== undefined) {
    refreshTokenCookie.value = tokens.refresh_token ?? null;
  }
}

export function clearAuthTokens() {
  const authTokensStore = useAuthTokensStore();
  const refreshTokenCookie = useCookie<string | null>('refresh_token');

  authTokensStore.clear();
  refreshTokenCookie.value = null;
}

export async function refreshAccessToken() {
  const authTokensStore = useAuthTokensStore();
  const refreshTokenCookie = useCookie<string | null>('refresh_token');

  if (!refreshTokenCookie.value) {
    authTokensStore.clear();
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshed = await sendRefreshRequest();
      const nextAccessToken = refreshed.accessToken ?? null;
      const nextRefreshToken = refreshed.refreshToken;

      authTokensStore.setAccessToken(nextAccessToken);

      if (nextRefreshToken !== undefined) {
        refreshTokenCookie.value = nextRefreshToken ?? null;
      }

      return nextAccessToken;
    } catch {
      clearAuthTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function getAccessTokenRefreshed() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (accessToken.value) {
    return accessToken.value;
  }

  if (!refreshToken.value) {
    await navigateTo('/auth/login');
    return null;
  }

  const refreshedAccessToken = await refreshAccessToken();
  if (!refreshedAccessToken) {
    await navigateTo('/auth/login');
    return null;
  }

  return refreshedAccessToken;
}
