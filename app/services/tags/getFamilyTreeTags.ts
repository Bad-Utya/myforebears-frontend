import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ListTagsResponseFactory from '~/services/tags/factories/ListTagsResponseFactory'

export async function sendGetFamilyTreeTagsConverted(treeId: string, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/tags`, request, new ListTagsResponseFactory(), 'GET')
}

export default async function sendGetFamilyTreeTagsRequest(treeId: string) {
  return sendGetFamilyTreeTagsConverted(treeId, new EmptyRequest())
}
