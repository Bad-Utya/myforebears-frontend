import getApiUrl from "~/composables/scripts/api/parseUrl";
import RegisterRequest from "~/composables/scripts/auth/dtos/requests/RegisterRequest";
import StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";
import type FetchResponse from "~/composables/scripts/api/dtos/FetchResponse";
import StatusResponse from "~/composables/scripts/api/dtos/StatusResponse";
import type LoginRequest from "~/composables/scripts/auth/dtos/requests/LoginRequest";
import {sendAsyncStatusRequest} from "~/composables/scripts/api/fetches/sendStatusRequest";
import getDependency from "~/composables/di/container";
import {sendAsyncDefaultRequest} from "~/composables/scripts/api/sendDefaultRequest";
import RefreshTokensRequest from "~/composables/scripts/auth/dtos/requests/RefreshTokensRequest";

export async function sendLoginConverted(request: RefreshTokensRequest) {
  return sendAsyncDefaultRequest('auth/refreshTokens', request, getDependency('refreshTokenFactory'), 'POST');
}

export default async function sendLoginRequest(refreshToken: string) {
  return sendLoginConverted(new RefreshTokensRequest(refreshToken));
}
