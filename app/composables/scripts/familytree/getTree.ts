import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import GetTreeRequest from "~/composables/scripts/familytree/dtos/requests/GetTreeRequest";
import GetTreeResponseFactory from "~/composables/scripts/familytree/factories/GetTreeResponseFactory";

export async function sendGetTreeConverted(treeId: string, request: GetTreeRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}`, request, new GetTreeResponseFactory(), 'GET');
}

export default async function sendGetTreeRequest(treeId: string) {
  return sendGetTreeConverted(treeId, new GetTreeRequest());
}
