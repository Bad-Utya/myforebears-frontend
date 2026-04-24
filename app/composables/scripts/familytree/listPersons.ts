import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import ListPersonsRequest from "~/composables/scripts/familytree/dtos/requests/ListPersonsRequest";
import ListPersonsResponseFactory from "~/composables/scripts/familytree/factories/ListPersonsResponseFactory";

export async function sendListPersonsConverted(treeId: string, request: ListPersonsRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/persons`, request, new ListPersonsResponseFactory(), 'GET');
}

export default async function sendListPersonsRequest(treeId: string) {
  return sendListPersonsConverted(treeId, new ListPersonsRequest());
}
