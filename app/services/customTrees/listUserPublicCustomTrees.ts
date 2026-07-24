import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ListCustomTreesResponseFactory from '~/services/customTrees/factories/ListCustomTreesResponseFactory'

export async function sendListUserPublicCustomTreesConverted(userId: number, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/public/users/${userId}`, request, new ListCustomTreesResponseFactory(), 'GET')
}

export default async function sendListUserPublicCustomTreesRequest(userId: number) {
  return sendListUserPublicCustomTreesConverted(userId, new EmptyRequest())
}
