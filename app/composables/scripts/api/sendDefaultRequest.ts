import getApiUrl from '~/composables/scripts/api/parseUrl'
import type FetchResponse from '~/composables/scripts/api/dtos/FetchResponse'
import type IApiRequest from '~/composables/scripts/api/interfaces/IApiRequest'
import type IResponseFactory from '~/composables/scripts/api/interfaces/IResponseFactory'
import getAuthorizationHeaders from '~/composables/scripts/api/getAuthorizationHeaders'
import ApiRequestError, { type FetchErrorData } from '~/composables/scripts/api/ApiRequestError'
import { ensureAuthResolved, refreshAccessToken } from '~/composables/scripts/cookies/getAccessToken'
import type { IFetchError } from 'ofetch'

export type HttpRequestType
  = | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE'
    | 'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace'

export function getRequestAwareHeaders() {
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

export async function getRequestAwareHeadersAsync(path?: string) {
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

export function getBodyOptions<TRequest extends IApiRequest>(method: string, request: TRequest) {
  if (method === 'GET' || method === 'HEAD') {
    return {}
  }

  const payload = request.toPayload()

  if (payload === null || payload === undefined) {
    return {}
  }

  const isPlainObject = typeof payload === 'object'
    && payload.constructor === Object

  if (isPlainObject && Object.keys(payload).length === 0) {
    return {}
  }

  if (typeof payload === 'string') {
    return {
      body: payload,
      headers: {
        'Content-Type': 'text/plain'
      }
    }
  }

  return { body: payload }
}

export function shouldTryRefresh(path: string, error: unknown, hasRetried: boolean) {
  if (hasRetried) {
    return false
  }

  if (path === 'auth/refresh') {
    return false
  }

  return ApiRequestError.isUnauthorizedInvalidToken(error)
}

async function executeDefaultFetchRequest<TFetchResponse>(
  path: string,
  type: HttpRequestType,
  requestOptions: Record<string, unknown>
) {
  const requestHeaders = (requestOptions.headers as Record<string, string> | undefined) ?? {}
  const authAwareHeaders = await getRequestAwareHeadersAsync(path)

  return await $fetch<FetchResponse<TFetchResponse>>(getApiUrl(path), {
    method: type,
    credentials: 'include',
    ...requestOptions,
    headers: {
      ...authAwareHeaders,
      ...requestHeaders
    }
  })
}

export async function sendAsyncDefaultFetchRequest<TRequest extends IApiRequest, TFetchResponse, TReturnDto>(
  path: string, request: TRequest,
  factory: IResponseFactory<TReturnDto, TFetchResponse>,
  type: HttpRequestType = 'POST') {
  const method = String(type).toUpperCase()
  const requestOptions = getBodyOptions(method, request)

  async function run(hasRetried = false): Promise<TReturnDto> {
    let data: FetchResponse<TFetchResponse>

    try {
      data = await executeDefaultFetchRequest<TFetchResponse>(path, type, requestOptions)
    } catch (error) {

      const apiError = error instanceof ApiRequestError
        ? error
        : ApiRequestError.createFromFetchError(error as IFetchError<FetchErrorData>);

      console.log(error);
      console.log(shouldTryRefresh(path, apiError, hasRetried));

      if (shouldTryRefresh(path, apiError, hasRetried)) {
        const refreshedAccessToken = await refreshAccessToken();

        console.log(refreshedAccessToken);

        if (refreshedAccessToken) {
          return run(true);
        }
      }

      throw apiError;
    }

    if (!data || data.data === null || data.data === undefined) {
      throw new ApiRequestError(
        data?.error ?? 'no_connection',
        data?.message ?? 'No connection to the server'
      )
    }

    console.log(path, data)

    const dataConverted = data.data as TFetchResponse
    return factory.createDTO(dataConverted)
  }

  return run()
}

export function sendAsyncDefaultHeadRequest<TRequest extends IApiRequest, TFetchResponse, TReturnDto>(
  path: string, request: TRequest,
  factory: IResponseFactory<TReturnDto, TFetchResponse>,
  type: HttpRequestType = 'POST') {
  const method = String(type).toUpperCase()
  const requestOptions = getBodyOptions(method, request)
  const hasRetried = ref(false)
  const isRetrying = ref(false)
  const requestHeaders = (requestOptions.headers as Record<string, string> | undefined) ?? {}

  const { data, pending, error, refresh } = useFetch<FetchResponse<TFetchResponse>>(getApiUrl(path), {
    method: type,
    credentials: 'include',
    ...requestOptions,
    headers: {
      ...getRequestAwareHeaders(),
      ...requestHeaders
    }
  })

  void watch(error, async (currentError) => {
    if (!currentError) {
      return
    }

    const apiError = ApiRequestError.createFromFetchError(currentError as IFetchError<FetchErrorData>)

    if (!shouldTryRefresh(path, apiError, hasRetried.value)) {
      return
    }

    hasRetried.value = true
    isRetrying.value = true

    try {
      const refreshedAccessToken = await refreshAccessToken()

      if (refreshedAccessToken) {
        await refresh()
      }
    } finally {
      isRetrying.value = false
    }
  })

  const requestPending = computed(() => pending.value || isRetrying.value)

  const dto = computed(() => {
    if (requestPending.value) {
      return undefined as TReturnDto
    }

    if (error.value) {
      throw ApiRequestError.createFromFetchError(error.value as IFetchError<FetchErrorData>)
    }

    if (!data.value || data.value.data === null || data.value.data === undefined) {
      throw new ApiRequestError(
        data.value?.error ?? 'no_connection',
        data.value?.message ?? 'No connection to the server'
      )
    }

    console.log(path, data.value)

    const dataConverted = data.value.data as TFetchResponse
    return factory.createDTO(dataConverted)
  })

  return { data: dto, pending: requestPending }
}
