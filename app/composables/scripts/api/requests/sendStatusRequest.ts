import getApiUrl from "~/composables/scripts/api/parseUrl";
import type FetchResponse from "~/composables/scripts/api/dtos/FetchResponse";
import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";
import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";
import {sendDefaultAsyncRequest} from "~/composables/scripts/api/sendRequest";
import type StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";
import type StatusResponse from "~/composables/scripts/api/dtos/StatusResponse";

export async function sendAsyncStatusRequest<TRequest extends IApiRequest>(
  path: string, request: TRequest,
  factory: IResponseFactory<StatusDTO, StatusResponse>,
  type: "GET" | "HEAD" | "PATCH" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "get" | "head" | "patch" | "post" | "put" | "delete" | "connect" | "options" | "trace"
  = 'POST') {
  return sendDefaultAsyncRequest(path, request, factory, type);
}
