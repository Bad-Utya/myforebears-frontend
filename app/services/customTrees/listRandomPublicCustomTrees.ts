import buildQueryString from '~/services/api/buildQueryString'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ListRandomPublicCustomTreesRequest from '~/services/customTrees/dtos/requests/ListRandomPublicCustomTreesRequest'
import ListCustomTreesResponseFactory from '~/services/customTrees/factories/ListCustomTreesResponseFactory'

export async function sendListRandomPublicCustomTreesConverted(request: ListRandomPublicCustomTreesRequest) {
  const query = buildQueryString({ limit: request.limit })
  return sendAsyncDefaultFetchRequest(`custom-trees/public/random?${query}`, request, new ListCustomTreesResponseFactory(), 'GET')
}

export default async function sendListRandomPublicCustomTreesRequest(limit: number = 20) {
  return sendListRandomPublicCustomTreesConverted(new ListRandomPublicCustomTreesRequest(limit))
}
