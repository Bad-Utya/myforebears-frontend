import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import GetUserInfoResponseFactory from "~/services/users/factories/GetUserInfoResponseFactory";
import UpdatePreferencesRequest from "~/services/users/dtos/requests/UpdatePreferencesRequest";

export async function sendUpdatePreferencesRequest(language?: string, theme?: string) {
  return sendAsyncDefaultFetchRequest('users/me/preferences', new UpdatePreferencesRequest(language, theme), new GetUserInfoResponseFactory(), 'PATCH');
}
