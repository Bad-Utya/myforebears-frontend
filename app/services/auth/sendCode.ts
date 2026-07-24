import {sendAsyncStatusRequest} from "~/services/api/fetches/sendStatusRequest";
import getDependency from "~/utils/di/container";
import SendCodeRequest from "~/services/auth/dtos/requests/SendCodeRequest";

export async function sendCodeConverted(request: SendCodeRequest) {
  return sendAsyncStatusRequest('auth/send-code', request, getDependency('statusFactory'), 'POST');
}

export default async function sendCodeRequest(email: string, password: string) {
  return sendCodeConverted(new SendCodeRequest(email, password));
}
