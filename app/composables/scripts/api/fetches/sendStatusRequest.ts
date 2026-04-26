import getApiUrl from "~/composables/scripts/api/parseUrl";
import type FetchResponse from "~/composables/scripts/api/dtos/FetchResponse";
import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";
import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";
import {
  type HttpRequestType,
  sendAsyncDefaultFetchRequest,
  sendAsyncDefaultHeadRequest
} from "~/composables/scripts/api/sendDefaultRequest";
import type StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";
import type StatusResponse from "~/composables/scripts/api/dtos/StatusResponse";

// todo properly use $fetch and useFetch
export async function sendAsyncStatusRequest<TRequest extends IApiRequest>(
  path: string, request: TRequest,
  factory: IResponseFactory<StatusDTO, StatusResponse>,
  type: HttpRequestType = 'POST') {
  return sendAsyncDefaultFetchRequest(path, request, factory, type);
}

export async function sendAsyncHeadStatusRequest<TRequest extends IApiRequest>(
  path: string, request: TRequest,
  factory: IResponseFactory<StatusDTO, StatusResponse>,
  type: HttpRequestType = 'POST') {
  return sendAsyncDefaultHeadRequest(path, request, factory, type);
}
