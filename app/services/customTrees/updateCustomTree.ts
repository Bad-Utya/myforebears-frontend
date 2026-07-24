import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import type UpdateCustomTreeRequest from '~/services/customTrees/dtos/requests/UpdateCustomTreeRequest'
import GetCustomTreeResponseFactory from '~/services/customTrees/factories/GetCustomTreeResponseFactory'

export async function sendUpdateCustomTreeConverted(treeId: string, request: UpdateCustomTreeRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}`, request, new GetCustomTreeResponseFactory(), 'PUT')
}

export default async function sendUpdateCustomTreeRequest(treeId: string, request: UpdateCustomTreeRequest) {
  return sendUpdateCustomTreeConverted(treeId, request)
}
