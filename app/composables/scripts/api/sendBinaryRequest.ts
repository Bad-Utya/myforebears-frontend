import getApiUrl from "~/composables/scripts/api/parseUrl";
import getAuthorizationHeaders from "~/composables/scripts/api/getAuthorizationHeaders";
import ApiRequestError, {type FetchErrorData} from "~/composables/scripts/api/ApiRequestError";
import {refreshAccessToken} from "~/composables/scripts/cookies/getAccessToken";
import type {IFetchError} from "ofetch";

export type BinaryHttpRequestType = "GET" | "HEAD" | "get" | "head";

export async function sendAsyncBinaryFetchRequest(
  path: string,
  type: BinaryHttpRequestType = 'GET'
) {
  async function run(hasRetried = false): Promise<Blob> {
    try {
      return await $fetch<Blob>(getApiUrl(path), {
        method: type,
        headers: getAuthorizationHeaders(),
        responseType: 'blob',
      });
    } catch (error) {
      const apiError = ApiRequestError.createFromFetchError(error as IFetchError<FetchErrorData>);

      if (!hasRetried && ApiRequestError.isUnauthorizedInvalidToken(apiError)) {
        const refreshedAccessToken = await refreshAccessToken();

        if (refreshedAccessToken) {
          return run(true);
        }
      }

      throw apiError;
    }
  }

  return run();
}
