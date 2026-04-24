import {sendAsyncStatusRequest} from "~/composables/scripts/api/fetches/sendStatusRequest";
import getDependency from "~/composables/di/container";
import SendCodeRequest from "~/composables/scripts/auth/dtos/requests/SendCodeRequest";

export async function sendRegisterConverted(request: SendCodeRequest) {
  return sendAsyncStatusRequest('auth/send-code', request, getDependency('statusFactory'), 'POST');
}

export default async function sendRegisterRequest(email: string, password: string) {
  return sendRegisterConverted(new SendCodeRequest(email, password));
}
