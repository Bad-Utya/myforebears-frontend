import RegisterRequest from "~/composables/scripts/auth/dtos/requests/RegisterRequest";
import {sendAsyncStatusRequest} from "~/composables/scripts/api/fetches/sendStatusRequest";
import getDependency from "~/composables/di/container";
import ResetPasswordByLinkRequest from "~/composables/scripts/auth/dtos/requests/ResetPasswordByLinkRequest";

export async function sendResetByLinkConverted(request: ResetPasswordByLinkRequest) {
  return sendAsyncStatusRequest('auth/sendResetLink', request, getDependency('statusFactory'), 'POST');
}

export default async function sendResetByLinkRequest(code: string, newPassword: string) {
  return sendResetByLinkConverted(new ResetPasswordByLinkRequest(code, newPassword));
}
