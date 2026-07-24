import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import ListPersonsRequest from "~/services/familytree/dtos/requests/ListPersonsRequest";
import ListPersonsResponseFactory from "~/services/familytree/factories/ListPersonsResponseFactory";

export async function sendListPersonsConverted(treeId: string, request: ListPersonsRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/persons`, request, new ListPersonsResponseFactory(), 'GET');
}

export default async function sendListPersonsRequest(treeId: string) {
  return sendListPersonsConverted(treeId, new ListPersonsRequest());
}
