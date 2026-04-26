import sendRefreshRequest from "~/composables/scripts/auth/refreshTokens";
import {useAuthTokensStore} from "~/composables/scripts/storages/create/authTokens";
import {useUserDataStore} from "~/composables/scripts/storages/create/userData";

export type StoredAuthTokens = {
  access_token?: string | null;
};

let refreshPromise: Promise<string | null> | null = null;

function setStoredAccessToken(nextAccessToken: string | null) {
  const authTokensStore = useAuthTokensStore();
  const userDataStore = useUserDataStore();
  const previousAccessToken = authTokensStore.accessToken;

  authTokensStore.setAccessToken(nextAccessToken);

  if (previousAccessToken !== nextAccessToken) {
    userDataStore.resetUserData();
  }
}

export function getAccessToken() {
  const tokens = useAuthTokensStore();
  return computed(() => tokens.accessToken);
}

export function persistAuthTokens(tokens: StoredAuthTokens) {
  setStoredAccessToken(tokens.access_token ?? null);
}

export function clearAuthTokens() {
  setStoredAccessToken(null);
}

export async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshed = await sendRefreshRequest();
      const nextAccessToken = refreshed.accessToken ?? null;

      setStoredAccessToken(nextAccessToken);

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

  if (accessToken.value) {
    return accessToken.value;
  }

  const refreshedAccessToken = await refreshAccessToken();

  return refreshedAccessToken ?? null;
}
