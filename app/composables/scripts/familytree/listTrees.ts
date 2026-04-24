import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import ListTreesRequest from "~/composables/scripts/familytree/dtos/requests/ListTreesRequest";
import ListTreesResponseFactory from "~/composables/scripts/familytree/factories/ListTreesResponseFactory";

export async function sendListTreesConverted(request: ListTreesRequest) {
  return sendAsyncDefaultFetchRequest('familytree/', request, new ListTreesResponseFactory(), 'GET');
}

export default async function sendListTreesRequest() {
  return sendListTreesConverted(new ListTreesRequest());
}
