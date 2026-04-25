import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import GetUserInfoRequest from "~/composables/scripts/users/dtos/requests/GetUserInfoRequest";
import GetUserInfoResponseFactory from "~/composables/scripts/users/factories/GetUserInfoResponseFactory";

export async function sendGetUserInfoConverted(userId: number, request: GetUserInfoRequest) {
  return sendAsyncDefaultFetchRequest(`users/${userId}`, request, new GetUserInfoResponseFactory(), 'GET');
}

export default async function sendGetUserInfoRequest(userId: number) {
  return sendGetUserInfoConverted(userId, new GetUserInfoRequest());
}
