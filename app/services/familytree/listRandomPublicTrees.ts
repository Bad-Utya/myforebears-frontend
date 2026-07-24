import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import ListRandomPublicTreesRequest from "~/services/familytree/dtos/requests/ListRandomPublicTreesRequest";
import ListTreesResponseFactory from "~/services/familytree/factories/ListTreesResponseFactory";

export async function sendListRandomPublicTreesConverted(request: ListRandomPublicTreesRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/public/random?limit=${request.limit}`, request, new ListTreesResponseFactory(), 'GET');
}

export default async function sendListRandomPublicTreesRequest(limit: number) {
  return sendListRandomPublicTreesConverted(new ListRandomPublicTreesRequest(limit));
}
