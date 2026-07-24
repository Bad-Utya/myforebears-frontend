import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import GetPublicPersonResponseFactory from '~/services/publicPersons/factories/GetPublicPersonResponseFactory'

export async function sendGetPublicPersonConverted(publicPersonId: string, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(`public-persons/${publicPersonId}`, request, new GetPublicPersonResponseFactory(), 'GET')
}

export default async function sendGetPublicPersonRequest(publicPersonId: string) {
  return sendGetPublicPersonConverted(publicPersonId, new EmptyRequest())
}
