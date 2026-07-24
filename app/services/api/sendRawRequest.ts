import getApiUrl from '~/services/api/parseUrl'
import type IApiRequest from '~/services/api/interfaces/IApiRequest'
import type IResponseFactory from '~/services/api/interfaces/IResponseFactory'
import {
  type HttpRequestType,
  getBodyOptions,
  getRequestAwareHeadersAsync,
  shouldTryRefresh
} from '~/services/api/sendDefaultRequest'
import ApiRequestError, { type FetchErrorData } from '~/services/api/ApiRequestError'
import { refreshAccessToken } from '~/utils/scripts/cookies/getAccessToken'
import type { IFetchError } from 'ofetch'

export async function sendAsyncRawFetchRequest<TRequest extends IApiRequest, TFetchResponse, TReturnDto>(
  path: string,
  request: TRequest,
  factory: IResponseFactory<TReturnDto, TFetchResponse>,
  type: HttpRequestType = 'POST'
) {
  const method = String(type).toUpperCase()
  const requestOptions = getBodyOptions(method, request)
  const requestHeaders = (requestOptions.headers as Record<string, string> | undefined) ?? {}

  async function run(hasRetried = false): Promise<TReturnDto> {
    let data: TFetchResponse

    try {
      const authAwareHeaders = await getRequestAwareHeadersAsync(path)

      data = await $fetch<TFetchResponse>(getApiUrl(path), {
        method: type,
        credentials: 'include',
        ...requestOptions,
        headers: {
          ...authAwareHeaders,
          ...requestHeaders
        }
      })
    } catch (error) {
      const apiError = error instanceof ApiRequestError
        ? error
        : ApiRequestError.createFromFetchError(error as IFetchError<FetchErrorData>)

      if (shouldTryRefresh(path, apiError, hasRetried)) {
        const refreshedAccessToken = await refreshAccessToken()

        if (refreshedAccessToken) {
          return run(true)
        }
      }

      throw apiError
    }

    if (data === null || data === undefined) {
      throw new ApiRequestError('no_connection', 'No connection to the server')
    }

    console.log(path, data)

    return factory.createDTO(data)
  }

  return run()
}
