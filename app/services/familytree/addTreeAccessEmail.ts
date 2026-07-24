import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import TreeAccessEmailRequest from "~/services/familytree/dtos/requests/TreeAccessEmailRequest";
import AddTreeAccessEmailResponseFactory from "~/services/familytree/factories/AddTreeAccessEmailResponseFactory";

export async function sendAddTreeAccessEmailConverted(treeId: string, request: TreeAccessEmailRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/access-emails`, request, new AddTreeAccessEmailResponseFactory(), 'POST');
}

export default async function sendAddTreeAccessEmailRequest(treeId: string, email: string) {
  return sendAddTreeAccessEmailConverted(treeId, new TreeAccessEmailRequest(email));
}
