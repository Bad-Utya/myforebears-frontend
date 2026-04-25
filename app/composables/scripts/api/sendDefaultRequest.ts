import getApiUrl from "~/composables/scripts/api/parseUrl";
import type FetchResponse from "~/composables/scripts/api/dtos/FetchResponse";
import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";
import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";
import getAuthorizationHeaders from "~/composables/scripts/api/getAuthorizationHeaders";
import ApiRequestError, {type FetchErrorData} from "~/composables/scripts/api/ApiRequestError";
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

function ensureSuccessDto(
  dto: unknown,
  fetchResponse?: {error?: string; message?: string}
) {
  const maybeStatusDto = dto as {isSuccessful?: boolean; message?: string};

  if (maybeStatusDto.isSuccessful === false) {
    throw new ApiRequestError(
      fetchResponse?.error ?? 'request_failed',
      maybeStatusDto.message ?? fetchResponse?.message ?? 'Request failed'
    );
  }
}

export async function sendAsyncDefaultFetchRequest<TRequest extends IApiRequest, TFetchResponse, TReturnDto>(
  path: string, request: TRequest,
  factory: IResponseFactory<TReturnDto, TFetchResponse>,
  type: HttpRequestType = 'POST') {
  // TODO refactor
  const method = String(type).toUpperCase();
  try {
    let data = await $fetch<FetchResponse<TFetchResponse>>(getApiUrl(path), {
      method: type,
      headers: getAuthorizationHeaders(),
      ...getBodyOptions(method, request),
    });

    if (!data?.data) {
      throw new ApiRequestError(
        data?.error ?? 'no_connection',
        data?.message ?? 'No connection to the server'
      );
    }

    let dataConverted = data.data as TFetchResponse;
    const dto = factory.createDTO(dataConverted);

    ensureSuccessDto(dto, data);

    return dto;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }

    throw ApiRequestError.createFromFetchError(error as IFetchError<FetchErrorData>);
  }
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

    const responseDto = factory.createDTO(data.value.data);

    ensureSuccessDto(responseDto, data.value);

    return responseDto;
  })

  return {data: dto, pending};
}
