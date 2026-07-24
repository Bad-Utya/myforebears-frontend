import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import AddPartnerRequest from "~/services/familytree/dtos/requests/AddPartnerRequest";
import AddPartnerResponseFactory from "~/services/familytree/factories/AddPartnerResponseFactory";

export async function sendAddPartnerConverted(treeId: string, request: AddPartnerRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/partners`, request, new AddPartnerResponseFactory(), 'POST');
}

export default async function sendAddPartnerRequest(treeId: string, request: AddPartnerRequest) {
  return sendAddPartnerConverted(treeId, request);
}
