import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import GetUserInfoRequest from "~/composables/scripts/users/dtos/requests/GetUserInfoRequest";
import GetUserInfoResponseFactory from "~/composables/scripts/users/factories/GetUserInfoResponseFactory";

export async function sendGetMyUserInfoConverted(request: GetUserInfoRequest) {
  return sendAsyncDefaultFetchRequest('users/me', request, new GetUserInfoResponseFactory(), 'GET');
}

export default async function sendGetMyUserInfoRequest() {
  return sendGetMyUserInfoConverted(new GetUserInfoRequest());
}
