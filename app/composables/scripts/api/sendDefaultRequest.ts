import getApiUrl from "~/composables/scripts/api/parseUrl";
import type FetchResponse from "~/composables/scripts/api/dtos/FetchResponse";
import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";
import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";
import getAuthorizationHeaders from "~/composables/scripts/api/getAuthorizationHeaders";

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

export async function sendAsyncDefaultFetchRequest<TRequest extends IApiRequest, TFetchResponse, TReturnDto>(
  path: string, request: TRequest,
  factory: IResponseFactory<TReturnDto, TFetchResponse>,
  type: HttpRequestType = 'POST') {
  // TODO refactor
  const method = String(type).toUpperCase();

  let data = await $fetch<FetchResponse<TFetchResponse>>(getApiUrl(path), {
    method: type,
    headers: getAuthorizationHeaders(),
    ...getBodyOptions(method, request),
  });

  if (!data || !data.data) {
    return factory.getNoConnectionErrorDTO();
  }

  let dataConverted = data.data as TFetchResponse;

  return factory.createDTO(dataConverted);
}

export function sendAsyncDefaultHeadRequest<TRequest extends IApiRequest, TFetchResponse, TReturnDto>(
  path: string, request: TRequest,
  factory: IResponseFactory<TReturnDto, TFetchResponse>,
  type: HttpRequestType = 'POST') {
  // TODO refactor
  const method = String(type).toUpperCase();

  let {data, pending} = useFetch<FetchResponse<TFetchResponse>>(getApiUrl(path), {
    method: type,
    headers: getAuthorizationHeaders(),
    ...getBodyOptions(method, request),
  });

  const dto = computed(() => {
    if (!data.value?.data) {
      return factory.getNoConnectionErrorDTO()
    }

    return factory.createDTO(data.value.data)
  })

  return {data: dto, pending};
}
