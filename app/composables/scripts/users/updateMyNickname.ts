import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import UpdateMyNicknameRequest from "~/composables/scripts/users/dtos/requests/UpdateMyNicknameRequest";
import UpdateMyNicknameResponseFactory from "~/composables/scripts/users/factories/UpdateMyNicknameResponseFactory";

export async function sendUpdateMyNicknameConverted(request: UpdateMyNicknameRequest) {
  return sendAsyncDefaultFetchRequest('users/me/nickname', request, new UpdateMyNicknameResponseFactory(), 'PATCH');
}

export default async function sendUpdateMyNicknameRequest(nickname: string) {
  return sendUpdateMyNicknameConverted(new UpdateMyNicknameRequest(nickname));
}
