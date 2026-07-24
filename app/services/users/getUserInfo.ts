import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import GetUserInfoRequest from "~/services/users/dtos/requests/GetUserInfoRequest";
import GetUserInfoResponseFactory from "~/services/users/factories/GetUserInfoResponseFactory";

export async function sendGetUserInfoConverted(userId: number, request: GetUserInfoRequest) {
  return sendAsyncDefaultFetchRequest(`users/${userId}`, request, new GetUserInfoResponseFactory(), 'GET');
}

export default async function sendGetUserInfoRequest(userId: number) {
  return sendGetUserInfoConverted(userId, new GetUserInfoRequest());
}
