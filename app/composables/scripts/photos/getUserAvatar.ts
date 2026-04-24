import {sendAsyncBinaryFetchRequest} from "~/composables/scripts/api/sendBinaryRequest";
import GetUserAvatarRequest from "~/composables/scripts/photos/dtos/requests/GetUserAvatarRequest";

export async function sendGetUserAvatarConverted(request: GetUserAvatarRequest) {
  return sendAsyncBinaryFetchRequest(`photos/user/avatar?user_id=${request.user_id}`, 'GET');
}

export default async function sendGetUserAvatarRequest(userId: number) {
  return sendGetUserAvatarConverted(new GetUserAvatarRequest(userId));
}
