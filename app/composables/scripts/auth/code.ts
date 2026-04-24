import getDependency from "~/composables/di/container";
import RegisterRequest from "~/composables/scripts/auth/dtos/requests/RegisterRequest";
import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";

export async function sendCodeConverted(request: RegisterRequest) {
  return sendAsyncDefaultFetchRequest('auth/register', request, getDependency('registerFactory'), 'POST');
}

export default async function sendCodeRequest(email: string, code: string) {
  return sendCodeConverted(new RegisterRequest(email, code));
}
