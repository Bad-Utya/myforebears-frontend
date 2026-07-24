import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import AddChildRequest from "~/services/familytree/dtos/requests/AddChildRequest";
import AddChildResponseFactory from "~/services/familytree/factories/AddChildResponseFactory";

export async function sendAddChildConverted(treeId: string, request: AddChildRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/children`, request, new AddChildResponseFactory(), 'POST');
}

export default async function sendAddChildRequest(treeId: string, request: AddChildRequest) {
  return sendAddChildConverted(treeId, request);
}
