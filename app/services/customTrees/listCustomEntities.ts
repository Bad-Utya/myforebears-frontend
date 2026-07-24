import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ListCustomEntitiesResponseFactory from '~/services/customTrees/factories/ListCustomEntitiesResponseFactory'

export async function sendListCustomEntitiesConverted(treeId: string, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}/entities`, request, new ListCustomEntitiesResponseFactory(), 'GET')
}

export default async function sendListCustomEntitiesRequest(treeId: string) {
  return sendListCustomEntitiesConverted(treeId, new EmptyRequest())
}
