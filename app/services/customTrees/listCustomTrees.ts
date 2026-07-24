import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ListCustomTreesResponseFactory from '~/services/customTrees/factories/ListCustomTreesResponseFactory'

export async function sendListCustomTreesConverted(request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest('custom-trees/', request, new ListCustomTreesResponseFactory(), 'GET')
}

export default async function sendListCustomTreesRequest() {
  return sendListCustomTreesConverted(new EmptyRequest())
}
