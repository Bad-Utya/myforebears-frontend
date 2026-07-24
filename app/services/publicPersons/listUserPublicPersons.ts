import buildQueryString from '~/services/api/buildQueryString'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ListUserPublicPersonsRequest from '~/services/publicPersons/dtos/requests/ListUserPublicPersonsRequest'
import ListPublicPersonsResponseFactory from '~/services/publicPersons/factories/ListPublicPersonsResponseFactory'

export async function sendListUserPublicPersonsConverted(userId: number, request: ListUserPublicPersonsRequest) {
  const query = buildQueryString({ limit: request.limit })
  return sendAsyncDefaultFetchRequest(`public-persons/users/${userId}?${query}`, request, new ListPublicPersonsResponseFactory(), 'GET')
}

export default async function sendListUserPublicPersonsRequest(userId: number, limit: number = 20) {
  return sendListUserPublicPersonsConverted(userId, new ListUserPublicPersonsRequest(limit))
}
