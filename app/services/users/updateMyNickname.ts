import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import UpdateMyNicknameRequest from "~/services/users/dtos/requests/UpdateMyNicknameRequest";
import UpdateMyNicknameResponseFactory from "~/services/users/factories/UpdateMyNicknameResponseFactory";

export async function sendUpdateMyNicknameConverted(request: UpdateMyNicknameRequest) {
  return sendAsyncDefaultFetchRequest('users/me/nickname', request, new UpdateMyNicknameResponseFactory(), 'PATCH');
}

export default async function sendUpdateMyNicknameRequest(nickname: string) {
  return sendUpdateMyNicknameConverted(new UpdateMyNicknameRequest(nickname));
}
