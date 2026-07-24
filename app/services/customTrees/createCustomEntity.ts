import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import CustomTreeEntityRequest from '~/services/customTrees/dtos/requests/CustomTreeEntityRequest'
import GetCustomEntityResponseFactory from '~/services/customTrees/factories/GetCustomEntityResponseFactory'

export async function sendCreateCustomEntityConverted(treeId: string, request: CustomTreeEntityRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}/entities`, request, new GetCustomEntityResponseFactory(), 'POST')
}

export default async function sendCreateCustomEntityRequest(
  treeId: string,
  name?: string,
  description?: string,
  parentId?: string
) {
  return sendCreateCustomEntityConverted(treeId, new CustomTreeEntityRequest(name, description, parentId))
}
