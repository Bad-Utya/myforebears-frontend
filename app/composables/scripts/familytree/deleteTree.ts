import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import DeleteTreeRequest from "~/composables/scripts/familytree/dtos/requests/DeleteTreeRequest";
import DeleteTreeResponseFactory from "~/composables/scripts/familytree/factories/DeleteTreeResponseFactory";

export async function sendDeleteTreeConverted(treeId: string, request: DeleteTreeRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}`, request, new DeleteTreeResponseFactory(), 'DELETE');
}

export default async function sendDeleteTreeRequest(treeId: string) {
  return sendDeleteTreeConverted(treeId, new DeleteTreeRequest());
}
