import getApiUrl from "~/composables/scripts/api/parseUrl";
import RegisterRequest from "~/utils/templates/auth/RegisterRequest";
import RegisterResponse from "~/utils/templates/auth/RegisterResponse";
import StatusDTO from "~/utils/templates/dtos/StatusDTO";
import type FetchResponse from "~/utils/templates/api/FetchResponse";

export default async function sendRegisterConverted(request: RegisterRequest) {
  let {data, status, error, refresh, clear} = await useFetch<FetchResponse<RegisterResponse>>(getApiUrl('auth/send-code'), {
    method: 'POST',
    body: request.toPayload()
  });

  if (!data.value || !data.value.data) {
    return new StatusDTO(false, "No connection to the server");
  }

  console.log(data)

  let response = data.value.data as RegisterResponse;

  if (response.status === 'ok') {
    return new StatusDTO(true);
  } else {
    return new StatusDTO(false, "Something got wrong, try again later");
  }
}

export async function sendRegisterRequest(email: string, password: string) {
  return sendRegisterConverted(new RegisterRequest(email, password));
}
