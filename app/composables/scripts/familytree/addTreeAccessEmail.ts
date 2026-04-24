import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import TreeAccessEmailRequest from "~/composables/scripts/familytree/dtos/requests/TreeAccessEmailRequest";
import AddTreeAccessEmailResponseFactory from "~/composables/scripts/familytree/factories/AddTreeAccessEmailResponseFactory";

export async function sendAddTreeAccessEmailConverted(treeId: string, request: TreeAccessEmailRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/access-emails`, request, new AddTreeAccessEmailResponseFactory(), 'POST');
}

export default async function sendAddTreeAccessEmailRequest(treeId: string, email: string) {
  return sendAddTreeAccessEmailConverted(treeId, new TreeAccessEmailRequest(email));
}
