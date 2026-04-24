import getApiUrl from "~/composables/scripts/api/parseUrl";

export type BinaryHttpRequestType = "GET" | "HEAD" | "get" | "head";

export async function sendAsyncBinaryFetchRequest(
  path: string,
  type: BinaryHttpRequestType = 'GET'
) {
  return $fetch<Blob>(getApiUrl(path), {
    method: type,
    responseType: 'blob',
  });
}

