import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import GetUserInfoRequest from "~/services/users/dtos/requests/GetUserInfoRequest";
import GetUserInfoResponseFactory from "~/services/users/factories/GetUserInfoResponseFactory";
import type GetMyUserInfoRequest from "~/services/users/dtos/requests/GetMyUserInfoRequest";
import GetMyUserInfoResponseFactory from "~/services/users/factories/GetMyUserInfoResponseFactory";

// TODO: use DI container
export async function sendGetMyUserInfoConverted(request: GetMyUserInfoRequest) {
  return sendAsyncDefaultFetchRequest('users/me', request, new GetMyUserInfoResponseFactory(), 'GET');
}

export default async function sendGetMyUserInfoRequest() {
  return sendGetMyUserInfoConverted(new GetUserInfoRequest());
}
