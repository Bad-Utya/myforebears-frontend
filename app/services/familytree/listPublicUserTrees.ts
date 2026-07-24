import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import ListPublicUserTreesRequest from "~/services/familytree/dtos/requests/ListPublicUserTreesRequest";
import ListTreesResponseFactory from "~/services/familytree/factories/ListTreesResponseFactory";

export async function sendListPublicUserTreesConverted(userId: number, request: ListPublicUserTreesRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/public/users/${userId}`, request, new ListTreesResponseFactory(), 'GET');
}

export default async function sendListPublicUserTreesRequest(userId: number) {
  return sendListPublicUserTreesConverted(userId, new ListPublicUserTreesRequest());
}
