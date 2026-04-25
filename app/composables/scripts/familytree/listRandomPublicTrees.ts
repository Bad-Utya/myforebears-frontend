import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import ListRandomPublicTreesRequest from "~/composables/scripts/familytree/dtos/requests/ListRandomPublicTreesRequest";
import ListTreesResponseFactory from "~/composables/scripts/familytree/factories/ListTreesResponseFactory";

export async function sendListRandomPublicTreesConverted(request: ListRandomPublicTreesRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/public/random?limit=${request.limit}`, request, new ListTreesResponseFactory(), 'GET');
}

export default async function sendListRandomPublicTreesRequest(limit: number) {
  return sendListRandomPublicTreesConverted(new ListRandomPublicTreesRequest(limit));
}
