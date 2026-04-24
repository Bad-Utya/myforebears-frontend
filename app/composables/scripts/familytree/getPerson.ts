import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import GetPersonRequest from "~/composables/scripts/familytree/dtos/requests/GetPersonRequest";
import GetPersonResponseFactory from "~/composables/scripts/familytree/factories/GetPersonResponseFactory";

export async function sendGetPersonConverted(treeId: string, personId: string, request: GetPersonRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/persons/${personId}`, request, new GetPersonResponseFactory(), 'GET');
}

export default async function sendGetPersonRequest(treeId: string, personId: string) {
  return sendGetPersonConverted(treeId, personId, new GetPersonRequest());
}
