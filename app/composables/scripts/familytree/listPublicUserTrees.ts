import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import ListPublicUserTreesRequest from "~/composables/scripts/familytree/dtos/requests/ListPublicUserTreesRequest";
import ListTreesResponseFactory from "~/composables/scripts/familytree/factories/ListTreesResponseFactory";

export async function sendListPublicUserTreesConverted(userId: number, request: ListPublicUserTreesRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/public/users/${userId}`, request, new ListTreesResponseFactory(), 'GET');
}

export default async function sendListPublicUserTreesRequest(userId: number) {
  return sendListPublicUserTreesConverted(userId, new ListPublicUserTreesRequest());
}
