import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import DeletePersonRequest from "~/services/familytree/dtos/requests/DeletePersonRequest";
import DeletePersonResponseFactory from "~/services/familytree/factories/DeletePersonResponseFactory";

export async function sendDeletePersonConverted(treeId: string, personId: string, request: DeletePersonRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/persons/${personId}`, request, new DeletePersonResponseFactory(), 'DELETE');
}

export default async function sendDeletePersonRequest(treeId: string, personId: string) {
  return sendDeletePersonConverted(treeId, personId, new DeletePersonRequest());
}
