import sendRefreshRequest from "~/composables/scripts/auth/refreshTokens";
import useAuthTokensState from "~/composables/scripts/storages/create/authTokens";

export type PersistedAuthTokens = {
  accessToken?: string | null;
  refreshToken?: string | null;
};

export function getAccessToken() {
  const tokens = useAuthTokensState();
  const accessTokenCookie = useCookie<string | null>('access_token');

  return computed<string | null>({
    get: () => tokens.value.accessToken ?? accessTokenCookie.value,
    set: (value) => {
      tokens.value.accessToken = value;
      accessTokenCookie.value = value;
    },
  });
}

export function getRefreshToken() {
  const tokens = useAuthTokensState();
  const refreshTokenCookie = useCookie<string | null>('refresh_token');

  return computed<string | null>({
    get: () => tokens.value.refreshToken ?? refreshTokenCookie.value,
    set: (value) => {
      tokens.value.refreshToken = value;
      refreshTokenCookie.value = value;
    },
  });
}

export function persistAuthTokens(tokens: PersistedAuthTokens) {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  accessToken.value = tokens.accessToken ?? null;
  refreshToken.value = tokens.refreshToken ?? null;
}

export async function getAccessTokenRefreshed() {
  const tokens = useAuthTokensState();
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (accessToken.value) {
    return accessToken.value;
  }

  if (!refreshToken.value) {
    await navigateTo('/auth/login');
    return null;
  }

  try {
    const refreshed = await sendRefreshRequest();
    if (!refreshed.isSuccessful || !refreshed.accessToken) {
      await navigateTo('/auth/login');
      return null;
    }

    persistAuthTokens({
      accessToken: refreshed.accessToken ?? null,
      refreshToken: refreshed.refreshToken ?? refreshToken.value ?? null,
    });

    return refreshed.accessToken ?? null;
  } catch {
    await navigateTo('/auth/login');
    return null;
  }
}
