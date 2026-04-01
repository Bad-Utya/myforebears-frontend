import getApiUrl from "~/composables/scripts/api/parseUrl";
import RegisterRequest from "~/composables/scripts/auth/dtos/RegisterRequest";
import StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";
import type FetchResponse from "~/composables/scripts/api/dtos/FetchResponse";
import StatusResponse from "~/composables/scripts/api/dtos/StatusResponse";
import {sendAsyncStatusRequest} from "~/composables/scripts/api/requests/sendStatusRequest";
import getDependency from "~/composables/di/container";

export default async function sendRegisterConverted(request: RegisterRequest) {
  return sendAsyncStatusRequest('auth/register', request, getDependency('statusFactory'), 'POST');
}

export async function sendRegisterRequest(email: string, password: string) {
  return sendRegisterConverted(new RegisterRequest(email, password));
}
