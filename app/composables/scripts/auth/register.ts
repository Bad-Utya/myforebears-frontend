import RegisterRequest from "~/composables/scripts/auth/dtos/requests/RegisterRequest";
import {sendAsyncStatusRequest} from "~/composables/scripts/api/fetches/sendStatusRequest";
import getDependency from "~/composables/di/container";

export async function sendRegisterConverted(request: RegisterRequest) {
  return sendAsyncStatusRequest('auth/register', request, getDependency('statusFactory'), 'POST');
}

export default async function sendRegisterRequest(email: string, password: string) {
  return sendRegisterConverted(new RegisterRequest(email, password));
}
