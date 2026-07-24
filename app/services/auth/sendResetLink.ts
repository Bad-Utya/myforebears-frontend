import {sendAsyncStatusRequest} from "~/services/api/fetches/sendStatusRequest";
import getDependency from "~/utils/di/container";
import SendResetLinkRequest from "~/services/auth/dtos/requests/SendResetLinkRequest";

export async function sendResetLinkConverted(request: SendResetLinkRequest) {
  return sendAsyncStatusRequest('auth/send-link-for-reset-password', request, getDependency('statusFactory'), 'POST');
}

export default async function sendResetLinkRequest(email: string) {
  return sendResetLinkConverted(new SendResetLinkRequest(email));
}
