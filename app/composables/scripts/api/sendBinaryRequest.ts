import getApiUrl from "~/composables/scripts/api/parseUrl";
import getAuthorizationHeaders from "~/composables/scripts/api/getAuthorizationHeaders";

export type BinaryHttpRequestType = "GET" | "HEAD" | "get" | "head";

export async function sendAsyncBinaryFetchRequest(
  path: string,
  type: BinaryHttpRequestType = 'GET'
) {
  return $fetch<Blob>(getApiUrl(path), {
    method: type,
    headers: getAuthorizationHeaders(),
    responseType: 'blob',
  });
}
