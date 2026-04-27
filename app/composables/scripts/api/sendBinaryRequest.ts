import getApiUrl from '~/composables/scripts/api/parseUrl'
import getAuthorizationHeaders from '~/composables/scripts/api/getAuthorizationHeaders'
import ApiRequestError, { type FetchErrorData } from '~/composables/scripts/api/ApiRequestError'
import { ensureAuthResolved, refreshAccessToken } from '~/composables/scripts/cookies/getAccessToken'
import type { IFetchError } from 'ofetch'

export type BinaryHttpRequestType = 'GET' | 'HEAD' | 'get' | 'head'

async function getRequestAwareHeadersAsync(path?: string) {
  if (path !== 'auth/refresh') {
    await ensureAuthResolved()
  }

  const authorizationHeaders = getAuthorizationHeaders() ?? {}

  if (import.meta.client) {
    return authorizationHeaders
  }

  const requestHeaders = useRequestHeaders(['cookie'])

  return {
    ...requestHeaders,
    ...authorizationHeaders
  }
}

export async function sendAsyncBinaryFetchRequest(
  path: string,
  type: BinaryHttpRequestType = 'GET'
) {
  async function run(hasRetried = false): Promise<Blob> {
    try {
      const requestHeaders = await getRequestAwareHeadersAsync(path)

      return await $fetch<Blob>(getApiUrl(path), {
        method: type,
        credentials: 'include',
        headers: requestHeaders,
        responseType: 'blob'
      })
    } catch (error) {
      const apiError = ApiRequestError.createFromFetchError(error as IFetchError<FetchErrorData>)

      if (!hasRetried && ApiRequestError.isUnauthorizedInvalidToken(apiError)) {
        const refreshedAccessToken = await refreshAccessToken()

        if (refreshedAccessToken) {
          return run(true)
        }
      }

      throw apiError
    }
  }

  return run()
}
