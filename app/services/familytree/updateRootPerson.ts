import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import GetTreeResponseFactory from "~/services/familytree/factories/GetTreeResponseFactory";
import UpdateTreeRootPersonRequest from "~/services/familytree/dtos/requests/UpdateTreeRootPersonRequest";

export async function sendUpdateTreeRootPersonRequest(treeId: string, rootPersonId: string) {
  const request = new UpdateTreeRootPersonRequest(rootPersonId);
  return sendAsyncDefaultFetchRequest(
    `familytree/${treeId}/root-person`,
    request,
    new GetTreeResponseFactory(),
    'PATCH'
  );
}
