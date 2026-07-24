import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import type UpdatePublicPersonRequest from '~/services/publicPersons/dtos/requests/UpdatePublicPersonRequest'
import GetPublicPersonResponseFactory from '~/services/publicPersons/factories/GetPublicPersonResponseFactory'

export async function sendUpdatePublicPersonConverted(publicPersonId: string, request: UpdatePublicPersonRequest) {
  return sendAsyncDefaultFetchRequest(`public-persons/${publicPersonId}`, request, new GetPublicPersonResponseFactory(), 'PUT')
}

export default async function sendUpdatePublicPersonRequest(publicPersonId: string, request: UpdatePublicPersonRequest) {
  return sendUpdatePublicPersonConverted(publicPersonId, request)
}
