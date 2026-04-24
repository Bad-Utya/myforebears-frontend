import {sendAsyncStatusRequest} from "~/composables/scripts/api/fetches/sendStatusRequest";
import getDependency from "~/composables/di/container";
import LogoutRequest from "~/composables/scripts/auth/dtos/requests/LogoutRequest";

export async function sendLogoutConverted(request: LogoutRequest) {
  return sendAsyncStatusRequest('auth/logout', request, getDependency('statusFactory'), 'POST');
}

export default async function sendLogoutRequest() {
  return sendLogoutConverted(new LogoutRequest());
}
