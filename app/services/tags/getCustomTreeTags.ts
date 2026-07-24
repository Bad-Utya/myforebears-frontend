import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ListTagsResponseFactory from '~/services/tags/factories/ListTagsResponseFactory'

export async function sendGetCustomTreeTagsConverted(treeId: string, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}/tags`, request, new ListTagsResponseFactory(), 'GET')
}

export default async function sendGetCustomTreeTagsRequest(treeId: string) {
  return sendGetCustomTreeTagsConverted(treeId, new EmptyRequest())
}
