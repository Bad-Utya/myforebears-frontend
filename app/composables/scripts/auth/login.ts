import LoginRequest from "~/composables/scripts/auth/dtos/requests/LoginRequest";
import getDependency from "~/composables/di/container";
import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";

export async function sendLoginConverted(request: LoginRequest) {
  return sendAsyncDefaultFetchRequest('auth/login', request, getDependency('loginFactory'), 'POST');
}

export default async function sendLoginRequest(email: string, password: string) {
  return sendLoginConverted(new LoginRequest(email, password));
}
