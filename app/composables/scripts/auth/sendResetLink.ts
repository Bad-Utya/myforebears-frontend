import {sendAsyncStatusRequest} from "~/composables/scripts/api/fetches/sendStatusRequest";
import getDependency from "~/composables/di/container";
import SendResetLinkRequest from "~/composables/scripts/auth/dtos/requests/SendResetLinkRequest";

export async function sendResetLinkConverted(request: SendResetLinkRequest) {
  return sendAsyncStatusRequest('auth/send-link-for-reset-password', request, getDependency('statusFactory'), 'POST');
}

export default async function sendResetLinkRequest(email: string) {
  return sendResetLinkConverted(new SendResetLinkRequest(email));
}
