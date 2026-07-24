import EmptyRequest from '~/services/api/requests/EmptyRequest'
import StatusResponseFactory from '~/services/api/factories/StatusResponseFactory'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'

export async function sendDeleteCustomEntityPhotoConverted(
  treeId: string,
  entityId: string,
  photoId: string,
  request: EmptyRequest
) {
  return sendAsyncDefaultFetchRequest(
    `custom-trees/${treeId}/entities/${entityId}/photos/${photoId}`,
    request,
    new StatusResponseFactory(),
    'DELETE'
  )
}

export default async function sendDeleteCustomEntityPhotoRequest(treeId: string, entityId: string, photoId: string) {
  return sendDeleteCustomEntityPhotoConverted(treeId, entityId, photoId, new EmptyRequest())
}
