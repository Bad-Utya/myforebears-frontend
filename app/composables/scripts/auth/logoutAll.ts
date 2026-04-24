import {sendAsyncStatusRequest} from "~/composables/scripts/api/fetches/sendStatusRequest";
import getDependency from "~/composables/di/container";
import LogoutAllRequest from "~/composables/scripts/auth/dtos/requests/LogoutAllRequest";

export async function sendLogoutAllConverted(request: LogoutAllRequest) {
  return sendAsyncStatusRequest('auth/logout-all', request, getDependency('statusFactory'), 'POST');
}

export default async function sendLogoutAllRequest() {
  return sendLogoutAllConverted(new LogoutAllRequest());
}
