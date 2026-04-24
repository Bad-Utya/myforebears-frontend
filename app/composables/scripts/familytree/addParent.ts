import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import AddParentRequest from "~/composables/scripts/familytree/dtos/requests/AddParentRequest";
import AddParentResponseFactory from "~/composables/scripts/familytree/factories/AddParentResponseFactory";

export async function sendAddParentConverted(treeId: string, request: AddParentRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/parents`, request, new AddParentResponseFactory(), 'POST');
}

export default async function sendAddParentRequest(treeId: string, request: AddParentRequest) {
  return sendAddParentConverted(treeId, request);
}
