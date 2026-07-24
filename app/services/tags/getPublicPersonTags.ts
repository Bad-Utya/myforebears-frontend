import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ListTagsResponseFactory from '~/services/tags/factories/ListTagsResponseFactory'

export async function sendGetPublicPersonTagsConverted(publicPersonId: string, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(`public-persons/${publicPersonId}/tags`, request, new ListTagsResponseFactory(), 'GET')
}

export default async function sendGetPublicPersonTagsRequest(publicPersonId: string) {
  return sendGetPublicPersonTagsConverted(publicPersonId, new EmptyRequest())
}
