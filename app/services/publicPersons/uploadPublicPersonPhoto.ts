import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import UploadPublicPersonPhotoRequest from '~/services/publicPersons/dtos/requests/UploadPublicPersonPhotoRequest'
import PublicPersonPhotoResponseFactory from '~/services/publicPersons/factories/PublicPersonPhotoResponseFactory'

export async function sendUploadPublicPersonPhotoConverted(publicPersonId: string, request: UploadPublicPersonPhotoRequest) {
  return sendAsyncDefaultFetchRequest(
    `public-persons/${publicPersonId}/photos`,
    request,
    new PublicPersonPhotoResponseFactory(),
    'POST'
  )
}

export default async function sendUploadPublicPersonPhotoRequest(
  publicPersonId: string,
  file: File,
  isAvatar?: boolean
) {
  return sendUploadPublicPersonPhotoConverted(publicPersonId, new UploadPublicPersonPhotoRequest(file, isAvatar))
}
