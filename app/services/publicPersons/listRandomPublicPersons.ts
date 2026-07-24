import buildQueryString from '~/services/api/buildQueryString'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ListRandomPublicPersonsRequest from '~/services/publicPersons/dtos/requests/ListRandomPublicPersonsRequest'
import ListPublicPersonsResponseFactory from '~/services/publicPersons/factories/ListPublicPersonsResponseFactory'

export async function sendListRandomPublicPersonsConverted(request: ListRandomPublicPersonsRequest) {
  const query = buildQueryString({ limit: request.limit })
  return sendAsyncDefaultFetchRequest(`public-persons/random?${query}`, request, new ListPublicPersonsResponseFactory(), 'GET')
}

export default async function sendListRandomPublicPersonsRequest(limit: number = 20) {
  return sendListRandomPublicPersonsConverted(new ListRandomPublicPersonsRequest(limit))
}
