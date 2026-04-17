import getApiUrl from "~/composables/scripts/api/parseUrl";
import RegisterRequest from "~/composables/scripts/auth/dtos/requests/RegisterRequest";
import StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";
import type FetchResponse from "~/composables/scripts/api/dtos/FetchResponse";
import StatusResponse from "~/composables/scripts/api/dtos/StatusResponse";
import type LoginRequest from "~/composables/scripts/auth/dtos/requests/LoginRequest";
import {sendAsyncStatusRequest} from "~/composables/scripts/api/fetches/sendStatusRequest";
import getDependency from "~/composables/di/container";
import {sendAsyncDefaultRequest} from "~/composables/scripts/api/sendDefaultRequest";

export async function sendLoginConverted(request: LoginRequest) {
  return sendAsyncDefaultRequest('auth/login', request, getDependency('loginFactory'), 'POST');
}

export default async function sendLoginRequest(email: string, password: string) {
  return sendLoginConverted(new RegisterRequest(email, password));
}
