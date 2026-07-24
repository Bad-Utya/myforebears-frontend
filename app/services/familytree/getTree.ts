import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import GetTreeRequest from "~/services/familytree/dtos/requests/GetTreeRequest";
import GetTreeResponseFactory from "~/services/familytree/factories/GetTreeResponseFactory";

export async function sendGetTreeConverted(treeId: string, request: GetTreeRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}`, request, new GetTreeResponseFactory(), 'GET');
}

export default async function sendGetTreeRequest(treeId: string) {
  return sendGetTreeConverted(treeId, new GetTreeRequest());
}
