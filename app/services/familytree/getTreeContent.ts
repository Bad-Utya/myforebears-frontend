import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import GetTreeContentRequest from "~/services/familytree/dtos/requests/GetTreeContentRequest";
import GetTreeContentResponseFactory from "~/services/familytree/factories/GetTreeContentResponseFactory";

export async function sendGetTreeContentConverted(treeId: string, request: GetTreeContentRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/content`, request, new GetTreeContentResponseFactory(), 'GET');
}

export default async function sendGetTreeContentRequest(treeId: string) {
  return sendGetTreeContentConverted(treeId, new GetTreeContentRequest());
}
