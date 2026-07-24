import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import GetCustomEntityResponseFactory from '~/services/customTrees/factories/GetCustomEntityResponseFactory'

export async function sendGetCustomEntityConverted(treeId: string, entityId: string, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}/entities/${entityId}`, request, new GetCustomEntityResponseFactory(), 'GET')
}

export default async function sendGetCustomEntityRequest(treeId: string, entityId: string) {
  return sendGetCustomEntityConverted(treeId, entityId, new EmptyRequest())
}
