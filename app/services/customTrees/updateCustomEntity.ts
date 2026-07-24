import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import CustomTreeEntityRequest from '~/services/customTrees/dtos/requests/CustomTreeEntityRequest'
import GetCustomEntityResponseFactory from '~/services/customTrees/factories/GetCustomEntityResponseFactory'

export async function sendUpdateCustomEntityConverted(treeId: string, entityId: string, request: CustomTreeEntityRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}/entities/${entityId}`, request, new GetCustomEntityResponseFactory(), 'PUT')
}

export default async function sendUpdateCustomEntityRequest(
  treeId: string,
  entityId: string,
  name?: string,
  description?: string,
  parentId?: string
) {
  return sendUpdateCustomEntityConverted(treeId, entityId, new CustomTreeEntityRequest(name, description, parentId))
}
