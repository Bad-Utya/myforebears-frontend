import getApiUrl from "~/composables/scripts/api/parseUrl";
import type FetchResponse from "~/composables/scripts/api/dtos/FetchResponse";
import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";
import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";
import getAuthorizationHeaders from "~/composables/scripts/api/getAuthorizationHeaders";
import ApiRequestError, {type FetchErrorData} from "~/composables/scripts/api/ApiRequestError";
import {refreshAccessToken} from "~/composables/scripts/cookies/getAccessToken";
import type {IFetchError} from "ofetch";

export type HttpRequestType =
  | "GET" | "HEAD" | "PATCH" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE"
  | "get" | "head" | "patch" | "post" | "put" | "delete" | "connect" | "options" | "trace";

function getBodyOptions<TRequest extends IApiRequest>(method: string, request: TRequest) {
  if (method === 'GET' || method === 'HEAD') {
    return {};
  }

  const payload = request.toPayload();

  if (payload === null || payload === undefined) {
    return {};
  }

  const isPlainObject = typeof payload === 'object'
    && payload.constructor === Object;

  if (isPlainObject && Object.keys(payload).length === 0) {
    return {};
  }

  return {body: payload};
}

function shouldTryRefresh(path: string, error: unknown, hasRetried: boolean) {
  if (hasRetried) {
    return false;
  }

  if (path === 'auth/refresh') {
    return false;
  }

  return ApiRequestError.isUnauthorizedInvalidToken(error);
}

async function executeDefaultFetchRequest<TFetchResponse>(
  path: string,
  type: HttpRequestType,
  method: string,
  requestOptions: Record<string, unknown>
) {
  return await $fetch<FetchResponse<TFetchResponse>>(getApiUrl(path), {
    method: type,
    headers: getAuthorizationHeaders(),
    ...requestOptions,
  });
}

export async function sendAsyncDefaultFetchRequest<TRequest extends IApiRequest, TFetchResponse, TReturnDto>(
  path: string, request: TRequest,
  factory: IResponseFactory<TReturnDto, TFetchResponse>,
  type: HttpRequestType = 'POST') {
  const method = String(type).toUpperCase();
  const requestOptions = getBodyOptions(method, request);

  async function run(hasRetried = false): Promise<TReturnDto> {
    try {
      const data = await executeDefaultFetchRequest<TFetchResponse>(path, type, method, requestOptions);

      if (!data?.data) {
        throw new ApiRequestError(
          data?.error ?? 'no_connection',
          data?.message ?? 'No connection to the server'
        );
      }

      console.log(path, data);

      const dataConverted = data.data as TFetchResponse;
      return factory.createDTO(dataConverted);
    } catch (error) {
      const apiError = error instanceof ApiRequestError
        ? error
        : ApiRequestError.createFromFetchError(error as IFetchError<FetchErrorData>);

      if (shouldTryRefresh(path, apiError, hasRetried)) {
        const refreshedAccessToken = await refreshAccessToken();

        if (refreshedAccessToken) {
          return run(true);
        }
      }

      throw apiError;
    }
  }

  return run();
}

export function sendAsyncDefaultHeadRequest<TRequest extends IApiRequest, TFetchResponse, TReturnDto>(
  path: string, request: TRequest,
  factory: IResponseFactory<TReturnDto, TFetchResponse>,
  type: HttpRequestType = 'POST') {
  // TODO refactor
  const method = String(type).toUpperCase();

  let {data, pending, error} = useFetch<FetchResponse<TFetchResponse>>(getApiUrl(path), {
    method: type,
    headers: getAuthorizationHeaders(),
    ...getBodyOptions(method, request),
  });

  const dto = computed(() => {
    if (error.value) {
      throw ApiRequestError.createFromFetchError(error.value as IFetchError<FetchErrorData>);
    }

    if (!data.value?.data) {
      throw new ApiRequestError('no_connection', 'No connection to the server');
    }

    return factory.createDTO(data.value.data);
  })

  return {data: dto, pending};
}
