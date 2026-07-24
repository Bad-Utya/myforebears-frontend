import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import AddParentRequest from "~/services/familytree/dtos/requests/AddParentRequest";
import AddParentResponseFactory from "~/services/familytree/factories/AddParentResponseFactory";

export async function sendAddParentConverted(treeId: string, request: AddParentRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/parents`, request, new AddParentResponseFactory(), 'POST');
}

export default async function sendAddParentRequest(treeId: string, request: AddParentRequest) {
  return sendAddParentConverted(treeId, request);
}
