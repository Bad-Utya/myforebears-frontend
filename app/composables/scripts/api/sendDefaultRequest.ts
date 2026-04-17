import getApiUrl from "~/composables/scripts/api/parseUrl";
import type FetchResponse from "~/composables/scripts/api/dtos/FetchResponse";
import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";
import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";

export type HttpRequestType =
  | "GET" | "HEAD" | "PATCH" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE"
  | "get" | "head" | "patch" | "post" | "put" | "delete" | "connect" | "options" | "trace";

export async function sendAsyncDefaultRequest<TRequest extends IApiRequest, TFetchResponse, TReturnDto>(
  path: string, request: TRequest,
  factory: IResponseFactory<TReturnDto, TFetchResponse>,
  type: HttpRequestType = 'POST') {
  let {data, status, error, refresh, clear} = useFetch<FetchResponse<TFetchResponse>>(getApiUrl(path), {
    method: type,
    body: request.toPayload()
  });

  if (!data.value || !data.value.data) {
    return factory.getNoConnectionErrorDTO();
  }

  let dataConverted = data.value.data as TFetchResponse;

  return factory.createDTO(dataConverted);
}
