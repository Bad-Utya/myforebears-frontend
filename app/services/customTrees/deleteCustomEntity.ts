import EmptyRequest from '~/services/api/requests/EmptyRequest'
import StatusResponseFactory from '~/services/api/factories/StatusResponseFactory'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'

export async function sendDeleteCustomEntityConverted(treeId: string, entityId: string, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}/entities/${entityId}`, request, new StatusResponseFactory(), 'DELETE')
}

export default async function sendDeleteCustomEntityRequest(treeId: string, entityId: string) {
  return sendDeleteCustomEntityConverted(treeId, entityId, new EmptyRequest())
}
