import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import AddChildRequest from "~/composables/scripts/familytree/dtos/requests/AddChildRequest";
import AddChildResponseFactory from "~/composables/scripts/familytree/factories/AddChildResponseFactory";

export async function sendAddChildConverted(treeId: string, request: AddChildRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/children`, request, new AddChildResponseFactory(), 'POST');
}

export default async function sendAddChildRequest(treeId: string, request: AddChildRequest) {
  return sendAddChildConverted(treeId, request);
}
