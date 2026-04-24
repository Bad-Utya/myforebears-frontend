import {sendAsyncStatusRequest} from "~/composables/scripts/api/fetches/sendStatusRequest";
import getDependency from "~/composables/di/container";
import ResetPasswordByLinkRequest from "~/composables/scripts/auth/dtos/requests/ResetPasswordByLinkRequest";

export async function sendResetByLinkConverted(request: ResetPasswordByLinkRequest) {
  return sendAsyncStatusRequest('auth/reset-password-with-link', request, getDependency('statusFactory'), 'POST');
}

export default async function sendResetByLinkRequest(link: string, password: string) {
  return sendResetByLinkConverted(new ResetPasswordByLinkRequest(link, password));
}
