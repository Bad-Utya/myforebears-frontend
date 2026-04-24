import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import AddPartnerRequest from "~/composables/scripts/familytree/dtos/requests/AddPartnerRequest";
import AddPartnerResponseFactory from "~/composables/scripts/familytree/factories/AddPartnerResponseFactory";

export async function sendAddPartnerConverted(treeId: string, request: AddPartnerRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/partners`, request, new AddPartnerResponseFactory(), 'POST');
}

export default async function sendAddPartnerRequest(treeId: string, request: AddPartnerRequest) {
  return sendAddPartnerConverted(treeId, request);
}
