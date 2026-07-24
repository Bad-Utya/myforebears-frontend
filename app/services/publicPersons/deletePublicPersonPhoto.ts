import EmptyRequest from '~/services/api/requests/EmptyRequest'
import StatusResponseFactory from '~/services/api/factories/StatusResponseFactory'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'

export async function sendDeletePublicPersonPhotoConverted(
  publicPersonId: string,
  photoId: string,
  request: EmptyRequest
) {
  return sendAsyncDefaultFetchRequest(
    `public-persons/${publicPersonId}/photos/${photoId}`,
    request,
    new StatusResponseFactory(),
    'DELETE'
  )
}

export default async function sendDeletePublicPersonPhotoRequest(publicPersonId: string, photoId: string) {
  return sendDeletePublicPersonPhotoConverted(publicPersonId, photoId, new EmptyRequest())
}
