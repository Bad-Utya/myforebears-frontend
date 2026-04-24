import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import UpdateTreeSettingsRequest from "~/composables/scripts/familytree/dtos/requests/UpdateTreeSettingsRequest";
import UpdateTreeSettingsResponseFactory from "~/composables/scripts/familytree/factories/UpdateTreeSettingsResponseFactory";

export async function sendUpdateTreeSettingsConverted(treeId: string, request: UpdateTreeSettingsRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}`, request, new UpdateTreeSettingsResponseFactory(), 'PATCH');
}

export default async function sendUpdateTreeSettingsRequest(treeId: string, isPublicOnMainPage: boolean, isViewRestricted: boolean) {
  return sendUpdateTreeSettingsConverted(treeId, new UpdateTreeSettingsRequest(isPublicOnMainPage, isViewRestricted));
}
