import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import GetPublicPersonResponseFactory from '~/services/publicPersons/factories/GetPublicPersonResponseFactory'

export async function sendCreatePublicPersonConverted(request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest('public-persons/', request, new GetPublicPersonResponseFactory(), 'POST')
}

export default async function sendCreatePublicPersonRequest() {
  return sendCreatePublicPersonConverted(new EmptyRequest())
}
