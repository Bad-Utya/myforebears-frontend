import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncBinaryFetchRequest } from '~/services/api/sendBinaryRequest'

export async function sendGetCustomEntityPhotoConverted(
  treeId: string,
  entityId: string,
  photoId: string,
  _request: EmptyRequest
) {
  return sendAsyncBinaryFetchRequest(`custom-trees/${treeId}/entities/${entityId}/photos/${photoId}`, 'GET')
}

export default async function sendGetCustomEntityPhotoRequest(treeId: string, entityId: string, photoId: string) {
  return sendGetCustomEntityPhotoConverted(treeId, entityId, photoId, new EmptyRequest())
}
