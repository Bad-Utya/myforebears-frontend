import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ListTagsResponseFactory from '~/services/tags/factories/ListTagsResponseFactory'

export async function sendListTagsConverted(request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest('tags', request, new ListTagsResponseFactory(), 'GET')
}

export default async function sendListTagsRequest() {
  return sendListTagsConverted(new EmptyRequest())
}
