import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import DeleteTreeRequest from "~/services/familytree/dtos/requests/DeleteTreeRequest";
import DeleteTreeResponseFactory from "~/services/familytree/factories/DeleteTreeResponseFactory";

export async function sendDeleteTreeConverted(treeId: string, request: DeleteTreeRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}`, request, new DeleteTreeResponseFactory(), 'DELETE');
}

export default async function sendDeleteTreeRequest(treeId: string) {
  return sendDeleteTreeConverted(treeId, new DeleteTreeRequest());
}
