import getDependency from "~/utils/di/container";
import RegisterRequest from "~/services/auth/dtos/requests/RegisterRequest";
import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";

export async function sendRegisterConverted(request: RegisterRequest) {
  return sendAsyncDefaultFetchRequest('auth/register', request, getDependency('registerFactory'), 'POST');
}

export default async function sendRegisterRequest(email: string, code: string) {
  return sendRegisterConverted(new RegisterRequest(email, code));
}
