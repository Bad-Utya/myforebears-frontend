import {sendAsyncStatusRequest} from "~/services/api/fetches/sendStatusRequest";
import getDependency from "~/utils/di/container";
import ResetPasswordByTokenRequest from "~/services/auth/dtos/requests/ResetPasswordByTokenRequest";

export async function sendResetByTokenConverted(request: ResetPasswordByTokenRequest) {
  return sendAsyncStatusRequest('auth/reset-password-with-token', request, getDependency('statusFactory'), 'POST');
}

export default async function sendResetByTokenRequest(password: string) {
  return sendResetByTokenConverted(new ResetPasswordByTokenRequest(password));
}
