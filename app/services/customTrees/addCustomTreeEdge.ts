import StatusResponseFactory from '~/services/api/factories/StatusResponseFactory'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import CustomTreeEdgeRequest from '~/services/customTrees/dtos/requests/CustomTreeEdgeRequest'

export async function sendAddCustomTreeEdgeConverted(treeId: string, request: CustomTreeEdgeRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}/edges`, request, new StatusResponseFactory(), 'POST')
}

export default async function sendAddCustomTreeEdgeRequest(treeId: string, childId: string, parentId: string) {
  return sendAddCustomTreeEdgeConverted(treeId, new CustomTreeEdgeRequest(childId, parentId))
}
