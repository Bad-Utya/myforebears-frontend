import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import SetTagsRequest from '~/services/tags/dtos/requests/SetTagsRequest'
import GetPublicPersonResponseFactory from '~/services/publicPersons/factories/GetPublicPersonResponseFactory'

export async function sendReplacePublicPersonTagsConverted(publicPersonId: string, request: SetTagsRequest) {
  return sendAsyncDefaultFetchRequest(`public-persons/${publicPersonId}/tags`, request, new GetPublicPersonResponseFactory(), 'PUT')
}

export default async function sendReplacePublicPersonTagsRequest(publicPersonId: string, tagCodes: string[]) {
  return sendReplacePublicPersonTagsConverted(publicPersonId, new SetTagsRequest(tagCodes))
}
