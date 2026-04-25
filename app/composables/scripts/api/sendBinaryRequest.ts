import getApiUrl from "~/composables/scripts/api/parseUrl";
import getAuthorizationHeaders from "~/composables/scripts/api/getAuthorizationHeaders";
import ApiRequestError, {type FetchErrorData} from "~/composables/scripts/api/ApiRequestError";
import type {IFetchError} from "ofetch";

export type BinaryHttpRequestType = "GET" | "HEAD" | "get" | "head";

export async function sendAsyncBinaryFetchRequest(
  path: string,
  type: BinaryHttpRequestType = 'GET'
) {
  try {
    return await $fetch<Blob>(getApiUrl(path), {
      method: type,
      headers: getAuthorizationHeaders(),
      responseType: 'blob',
    });
  } catch (error) {
    throw ApiRequestError.createFromFetchError(error as IFetchError<FetchErrorData>);
  }
}
