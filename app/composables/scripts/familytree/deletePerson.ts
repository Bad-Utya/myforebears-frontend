import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import DeletePersonRequest from "~/composables/scripts/familytree/dtos/requests/DeletePersonRequest";
import DeletePersonResponseFactory from "~/composables/scripts/familytree/factories/DeletePersonResponseFactory";

export async function sendDeletePersonConverted(treeId: string, personId: string, request: DeletePersonRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/persons/${personId}`, request, new DeletePersonResponseFactory(), 'DELETE');
}

export default async function sendDeletePersonRequest(treeId: string, personId: string) {
  return sendDeletePersonConverted(treeId, personId, new DeletePersonRequest());
}
