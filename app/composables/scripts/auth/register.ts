import getApiUrl from "~/composables/scripts/api/parseUrl";
import RegisterRequest from "~/utils/templates/auth/RegisterRequest";
import RegisterResponse from "~/utils/templates/auth/RegisterResponse";

export default async function sendRegisterConverted(request: RegisterRequest) {
  let {data, status, error, refresh, clear} = await useFetch(getApiUrl('auth/send-code'), {
    method: 'POST',
    body: request.toPayload()
  });

  console.log(status);
  console.log(error);

  return {code: data.value ?? '', message: error.value} as RegisterResponse;
}

export async function sendRegisterRequest(email: string, password: string) {
  return sendRegisterConverted(new RegisterRequest(email, password));
}
