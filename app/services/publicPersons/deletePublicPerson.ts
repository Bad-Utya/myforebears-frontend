import EmptyRequest from '~/services/api/requests/EmptyRequest'
import StatusResponseFactory from '~/services/api/factories/StatusResponseFactory'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'

export async function sendDeletePublicPersonConverted(publicPersonId: string, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(`public-persons/${publicPersonId}`, request, new StatusResponseFactory(), 'DELETE')
}

export default async function sendDeletePublicPersonRequest(publicPersonId: string) {
  return sendDeletePublicPersonConverted(publicPersonId, new EmptyRequest())
}
