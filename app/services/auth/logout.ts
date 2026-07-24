import {sendAsyncStatusRequest} from "~/services/api/fetches/sendStatusRequest";
import getDependency from "~/utils/di/container";
import LogoutRequest from "~/services/auth/dtos/requests/LogoutRequest";

export async function sendLogoutConverted(request: LogoutRequest) {
  return sendAsyncStatusRequest('auth/logout', request, getDependency('statusFactory'), 'POST');
}

export default async function sendLogoutRequest() {
  return sendLogoutConverted(new LogoutRequest());
}
