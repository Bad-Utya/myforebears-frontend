export function getAccessToken() {
  return useCookie<string | null>('access_token');
}

export function getAccessTokenRefreshed() {
  return useCookie<string | null>('access_token');
}
