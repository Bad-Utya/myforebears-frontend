import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import TreeAccessEmailRequest from "~/services/familytree/dtos/requests/TreeAccessEmailRequest";
import DeleteTreeAccessEmailResponseFactory from "~/services/familytree/factories/DeleteTreeAccessEmailResponseFactory";

export async function sendDeleteTreeAccessEmailConverted(treeId: string, request: TreeAccessEmailRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/access-emails`, request, new DeleteTreeAccessEmailResponseFactory(), 'DELETE');
}

export default async function sendDeleteTreeAccessEmailRequest(treeId: string, email: string) {
  return sendDeleteTreeAccessEmailConverted(treeId, new TreeAccessEmailRequest(email));
}
