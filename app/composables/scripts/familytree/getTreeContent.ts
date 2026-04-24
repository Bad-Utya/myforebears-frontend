import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import GetTreeContentRequest from "~/composables/scripts/familytree/dtos/requests/GetTreeContentRequest";
import GetTreeContentResponseFactory from "~/composables/scripts/familytree/factories/GetTreeContentResponseFactory";

export async function sendGetTreeContentConverted(treeId: string, request: GetTreeContentRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/content`, request, new GetTreeContentResponseFactory(), 'GET');
}

export default async function sendGetTreeContentRequest(treeId: string) {
  return sendGetTreeContentConverted(treeId, new GetTreeContentRequest());
}
