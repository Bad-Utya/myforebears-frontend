import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import SetTagsRequest from '~/services/tags/dtos/requests/SetTagsRequest'
import GetCustomTreeResponseFactory from '~/services/customTrees/factories/GetCustomTreeResponseFactory'

export async function sendReplaceCustomTreeTagsConverted(treeId: string, request: SetTagsRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}/tags`, request, new GetCustomTreeResponseFactory(), 'PUT')
}

export default async function sendReplaceCustomTreeTagsRequest(treeId: string, tagCodes: string[]) {
  return sendReplaceCustomTreeTagsConverted(treeId, new SetTagsRequest(tagCodes))
}
