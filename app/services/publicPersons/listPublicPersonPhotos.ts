import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ListPublicPersonPhotosResponseFactory from '~/services/publicPersons/factories/ListPublicPersonPhotosResponseFactory'

export async function sendListPublicPersonPhotosConverted(publicPersonId: string, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(
    `public-persons/${publicPersonId}/photos`,
    request,
    new ListPublicPersonPhotosResponseFactory(),
    'GET'
  )
}

export default async function sendListPublicPersonPhotosRequest(publicPersonId: string) {
  return sendListPublicPersonPhotosConverted(publicPersonId, new EmptyRequest())
}
