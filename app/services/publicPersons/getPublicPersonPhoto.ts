import { sendAsyncBinaryFetchRequest } from '~/services/api/sendBinaryRequest'
import EmptyRequest from '~/services/api/requests/EmptyRequest'

export async function sendGetPublicPersonPhotoConverted(
  publicPersonId: string,
  photoId: string,
  _request: EmptyRequest
) {
  return sendAsyncBinaryFetchRequest(`public-persons/${publicPersonId}/photos/${photoId}`, 'GET')
}

export default async function sendGetPublicPersonPhotoRequest(publicPersonId: string, photoId: string) {
  return sendGetPublicPersonPhotoConverted(publicPersonId, photoId, new EmptyRequest())
}
