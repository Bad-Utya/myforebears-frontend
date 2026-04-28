import {sendAsyncBinaryFetchRequest} from "~/composables/scripts/api/sendBinaryRequest";

export async function sendGetTreeAvatarConverted(treeId: string) {
  return sendAsyncBinaryFetchRequest(`photos/${treeId}/avatar`, 'GET');
}

export default async function sendGetTreeAvatarRequest(treeId: string) {
  return sendGetTreeAvatarConverted(treeId);
}
