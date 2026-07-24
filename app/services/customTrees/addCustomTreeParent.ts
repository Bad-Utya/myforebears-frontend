import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import CustomTreeParentRequest from '~/services/customTrees/dtos/requests/CustomTreeParentRequest'
import GetCustomEntityResponseFactory from '~/services/customTrees/factories/GetCustomEntityResponseFactory'

export async function sendAddCustomTreeParentConverted(treeId: string, request: CustomTreeParentRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}/parents`, request, new GetCustomEntityResponseFactory(), 'POST')
}

export default async function sendAddCustomTreeParentRequest(
  treeId: string,
  childId: string,
  name?: string,
  description?: string
) {
  return sendAddCustomTreeParentConverted(treeId, new CustomTreeParentRequest(childId, name, description))
}
