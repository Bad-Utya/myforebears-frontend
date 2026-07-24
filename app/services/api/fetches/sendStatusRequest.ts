import getApiUrl from "~/services/api/parseUrl";
import type FetchResponse from "~/services/api/dtos/FetchResponse";
import type IApiRequest from "~/services/api/interfaces/IApiRequest";
import type IResponseFactory from "~/services/api/interfaces/IResponseFactory";
import {
  type HttpRequestType,
  sendAsyncDefaultFetchRequest,
  sendAsyncDefaultHeadRequest
} from "~/services/api/sendDefaultRequest";
import type StatusDTO from "~/services/api/dtos/StatusDTO";
import type StatusResponse from "~/services/api/dtos/StatusResponse";

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
