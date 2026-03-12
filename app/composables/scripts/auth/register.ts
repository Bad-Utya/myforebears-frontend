import getApiUrl from "~/composables/scripts/api/parseUrl";
import RegisterRequest from "~/composables/scripts/auth/dtos/RegisterRequest";
import RegisterResponse from "~/composables/scripts/auth/dtos/RegisterResponse";
import StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";
import type FetchResponse from "~/composables/scripts/api/dtos/FetchResponse";

export default async function sendRegisterConverted(request: RegisterRequest) {
  let {data, status, error, refresh, clear} = await useFetch<FetchResponse<RegisterResponse>>(getApiUrl('auth/send-code'), {
    method: 'POST',
    body: request.toPayload()
  });

  if (!data.value || !data.value.data) {
    return new StatusDTO(false, "No connection to the server");
  }

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
