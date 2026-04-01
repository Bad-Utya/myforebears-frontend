import getApiUrl from "~/composables/scripts/api/parseUrl";
import RegisterRequest from "~/composables/scripts/auth/dtos/RegisterRequest";
import StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";
import type FetchResponse from "~/composables/scripts/api/dtos/FetchResponse";
import StatusResponse from "~/composables/scripts/api/dtos/StatusResponse";
import {sendAsyncStatusRequest} from "~/composables/scripts/api/requests/sendStatusRequest";
import getDependency from "~/composables/di/container";

export async function sendResetLinkConverted(request: RegisterRequest) {
  return sendAsyncStatusRequest('auth/send-link-for-reset-password', request, getDependency('statusFactory'), 'POST');
}

export default async function sendResetLinkRequest(email: string, password: string) {
  return sendResetLinkConverted(new RegisterRequest(email, password));
}
