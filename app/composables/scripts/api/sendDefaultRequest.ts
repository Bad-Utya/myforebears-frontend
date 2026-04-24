import getApiUrl from "~/composables/scripts/api/parseUrl";
import type FetchResponse from "~/composables/scripts/api/dtos/FetchResponse";
import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";
import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";

export type HttpRequestType =
  | "GET" | "HEAD" | "PATCH" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE"
  | "get" | "head" | "patch" | "post" | "put" | "delete" | "connect" | "options" | "trace";

export async function sendAsyncDefaultFetchRequest<TRequest extends IApiRequest, TFetchResponse, TReturnDto>(
  path: string, request: TRequest,
  factory: IResponseFactory<TReturnDto, TFetchResponse>,
  type: HttpRequestType = 'POST') {
  let data = await $fetch<FetchResponse<TFetchResponse>>(getApiUrl(path), {
    method: type,
    body: request.toPayload()
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
  let {data, pending} = useFetch<FetchResponse<TFetchResponse>>(getApiUrl(path), {
    method: type,
    body: request.toPayload()
  });

  const dto = computed(() => {
    if (!data.value?.data) {
      return factory.getNoConnectionErrorDTO()
    }

    return factory.createDTO(data.value.data)
  })

  return {data: dto, pending};
}
