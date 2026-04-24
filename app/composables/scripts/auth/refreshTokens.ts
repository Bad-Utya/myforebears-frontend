import getDependency from "~/composables/di/container";
import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import RefreshRequest from "~/composables/scripts/auth/dtos/requests/RefreshRequest";

export async function sendRefreshConverted(request: RefreshRequest) {
  return sendAsyncDefaultFetchRequest('auth/refresh', request, getDependency('refreshTokenFactory'), 'POST');
}

export default async function sendRefreshRequest() {
  return sendRefreshConverted(new RefreshRequest());
}
