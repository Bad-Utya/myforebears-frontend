import RegisterRequest from "~/composables/scripts/auth/dtos/RegisterRequest";
import {sendAsyncStatusRequest} from "~/composables/scripts/api/requests/sendStatusRequest";
import getDependency from "~/composables/di/container";

export async function sendResetByLinkConverted(request: RegisterRequest) {
  return sendAsyncStatusRequest('auth/register', request, getDependency('statusFactory'), 'POST');
}

export default async function sendResetByLinkRequest(email: string, password: string) {
  return sendResetByLinkConverted(new RegisterRequest(email, password));
}
