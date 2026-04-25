import getDependency from "~/composables/di/container";
import RegisterRequest from "~/composables/scripts/auth/dtos/requests/RegisterRequest";
import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";

export async function sendRegisterConverted(request: RegisterRequest) {
  return sendAsyncDefaultFetchRequest('auth/register', request, getDependency('registerFactory'), 'POST');
}

export default async function sendRegisterRequest(email: string, code: string) {
  return sendRegisterConverted(new RegisterRequest(email, code));
}
