import sendRefreshRequest from '~/composables/scripts/auth/refreshTokens'
import { useAuthTokensStore } from '~/composables/scripts/storages/create/authTokens'
import { useUserDataStore } from '~/composables/scripts/storages/create/userData'

export type StoredAuthTokens = {
  access_token?: string | null
}

let refreshPromise: Promise<string | null> | null = null
let authResolvePromise: Promise<string | null> | null = null
let authResolved = false

function sleep(timeoutMs: number) {
  return new Promise(resolve => setTimeout(resolve, timeoutMs))
}

function setStoredAccessToken(nextAccessToken: string | null) {
  const authTokensStore = useAuthTokensStore()
  const userDataStore = useUserDataStore()
  const previousAccessToken = authTokensStore.accessToken

  authTokensStore.setAccessToken(nextAccessToken)

  if (previousAccessToken !== nextAccessToken) {
    userDataStore.resetUserData()
  }
}

export function getAccessToken() {
  const tokens = useAuthTokensStore()
  return computed(() => tokens.accessToken)
}

export async function waitForAccessToken(timeoutMs = 900, intervalMs = 30) {
  const accessToken = getAccessToken()

  if (accessToken.value) {
    return accessToken.value
  }

  if (!import.meta.client || timeoutMs <= 0) {
    return accessToken.value ?? null
  }

  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    await sleep(intervalMs)

    if (accessToken.value) {
      return accessToken.value
    }
  }

  return accessToken.value ?? null
}

export function hasResolvedAuthState() {
  return authResolved
}

export function markAuthResolved(value = true) {
  authResolved = value
}

export function persistAuthTokens(tokens: StoredAuthTokens) {
  setStoredAccessToken(tokens.access_token ?? null)
  authResolved = true
}

export function clearAuthTokens() {
  setStoredAccessToken(null)
  authResolved = true
}

export async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const refreshed = await sendRefreshRequest()
      const nextAccessToken = refreshed.accessToken ?? null

      setStoredAccessToken(nextAccessToken)
      authResolved = true

      return nextAccessToken
    } catch {
      clearAuthTokens()

      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function ensureAuthResolved() {
  const accessToken = getAccessToken()

  if (authResolved) {
    return accessToken.value ?? null
  }

  if (accessToken.value) {
    authResolved = true
    return accessToken.value
  }

  if (!import.meta.client) {
    authResolved = true
    return accessToken.value ?? null
  }

  if (authResolvePromise) {
    return authResolvePromise
  }

  authResolvePromise = (async () => {
    try {
      const resolvedToken = await refreshAccessToken()
      return resolvedToken ?? null
    } finally {
      authResolved = true
      authResolvePromise = null
    }
  })()

  return authResolvePromise
}

export async function getAccessTokenRefreshed() {
  return await ensureAuthResolved()
}
