import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import ListTreesRequest from "~/services/familytree/dtos/requests/ListTreesRequest";
import ListTreesResponseFactory from "~/services/familytree/factories/ListTreesResponseFactory";

export async function sendListTreesConverted(request: ListTreesRequest) {
  return sendAsyncDefaultFetchRequest('familytree/', request, new ListTreesResponseFactory(), 'GET');
}

export default async function sendListTreesRequest() {
  return sendListTreesConverted(new ListTreesRequest());
}
