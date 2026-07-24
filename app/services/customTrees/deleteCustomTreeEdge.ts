import StatusResponseFactory from '~/services/api/factories/StatusResponseFactory'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import CustomTreeEdgeRequest from '~/services/customTrees/dtos/requests/CustomTreeEdgeRequest'

export async function sendDeleteCustomTreeEdgeConverted(treeId: string, request: CustomTreeEdgeRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}/edges`, request, new StatusResponseFactory(), 'DELETE')
}

export default async function sendDeleteCustomTreeEdgeRequest(treeId: string, childId: string, parentId: string) {
  return sendDeleteCustomTreeEdgeConverted(treeId, new CustomTreeEdgeRequest(childId, parentId))
}
