import CodeRequest from "~/composables/scripts/auth/dtos/CodeRequest";
import type FetchResponse from "~/composables/scripts/api/dtos/FetchResponse";
import getApiUrl from "~/composables/scripts/api/parseUrl";
import StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";
import type StatusResponse from "~/composables/scripts/api/dtos/StatusResponse";
import {sendAsyncStatusRequest} from "~/composables/scripts/api/requests/sendStatusRequest";
import getDependency from "~/composables/di/container";
import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";

export async function sendCodeConverted(request: CodeRequest) {
  return sendAsyncStatusRequest('auth/send-code', request, getDependency('statusFactory'), 'POST');
}

export default async function sendCodeRequest(email: string, code: string) {
  return sendCodeConverted(new CodeRequest(email, code));
}
