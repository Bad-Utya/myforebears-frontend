import getDependency from "~/utils/di/container";
import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import RefreshRequest from "~/services/auth/dtos/requests/RefreshRequest";

export async function sendRefreshConverted(request: RefreshRequest) {
  return sendAsyncDefaultFetchRequest('auth/refresh', request, getDependency('refreshTokenFactory'), 'POST');
}

export default async function sendRefreshRequest() {
  return sendRefreshConverted(new RefreshRequest());
}
