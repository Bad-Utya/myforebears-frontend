import {sendAsyncStatusRequest} from "~/services/api/fetches/sendStatusRequest";
import getDependency from "~/utils/di/container";
import LogoutAllRequest from "~/services/auth/dtos/requests/LogoutAllRequest";

export async function sendLogoutAllConverted(request: LogoutAllRequest) {
  return sendAsyncStatusRequest('auth/logout-all', request, getDependency('statusFactory'), 'POST');
}

export default async function sendLogoutAllRequest() {
  return sendLogoutAllConverted(new LogoutAllRequest());
}
