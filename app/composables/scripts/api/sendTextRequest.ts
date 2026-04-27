import getApiUrl from '~/composables/scripts/api/parseUrl'
import getAuthorizationHeaders from '~/composables/scripts/api/getAuthorizationHeaders'
import ApiRequestError, { type FetchErrorData } from '~/composables/scripts/api/ApiRequestError'
import { refreshAccessToken } from '~/composables/scripts/cookies/getAccessToken'
import type { IFetchError } from 'ofetch'

export type TextHttpRequestType = 'GET' | 'HEAD' | 'get' | 'head'

function getRequestAwareHeaders() {
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

export async function sendAsyncTextFetchRequest(
  path: string,
  type: TextHttpRequestType = 'GET'
) {
  async function run(hasRetried = false): Promise<string> {
    try {
      return await $fetch<string>(getApiUrl(path), {
        method: type,
        credentials: 'include',
        headers: getRequestAwareHeaders(),
        responseType: 'text'
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
