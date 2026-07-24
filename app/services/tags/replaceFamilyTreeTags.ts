import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import SetTagsRequest from '~/services/tags/dtos/requests/SetTagsRequest'
import GetTreeResponseFactory from '~/services/familytree/factories/GetTreeResponseFactory'

export async function sendReplaceFamilyTreeTagsConverted(treeId: string, request: SetTagsRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/tags`, request, new GetTreeResponseFactory(), 'PUT')
}

export default async function sendReplaceFamilyTreeTagsRequest(treeId: string, tagCodes: string[]) {
  return sendReplaceFamilyTreeTagsConverted(treeId, new SetTagsRequest(tagCodes))
}
