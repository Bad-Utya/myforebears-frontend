import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import UpdateTreeSettingsRequest from "~/services/familytree/dtos/requests/UpdateTreeSettingsRequest";
import UpdateTreeSettingsResponseFactory from "~/services/familytree/factories/UpdateTreeSettingsResponseFactory";

export async function sendUpdateTreeSettingsConverted(treeId: string, request: UpdateTreeSettingsRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}`, request, new UpdateTreeSettingsResponseFactory(), 'PATCH');
}

export default async function sendUpdateTreeSettingsRequest(
  treeId: string,
  isPublicOnMainPage: boolean,
  isViewRestricted: boolean,
  name?: string,
  description?: string
) {
  return sendUpdateTreeSettingsConverted(treeId, new UpdateTreeSettingsRequest(name, description, isPublicOnMainPage, isViewRestricted));
}
