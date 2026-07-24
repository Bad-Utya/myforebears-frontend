import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ListCustomPhotosResponseFactory from '~/services/customTrees/factories/ListCustomPhotosResponseFactory'

export async function sendListCustomEntityPhotosConverted(treeId: string, entityId: string, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(
    `custom-trees/${treeId}/entities/${entityId}/photos`,
    request,
    new ListCustomPhotosResponseFactory(),
    'GET'
  )
}

export default async function sendListCustomEntityPhotosRequest(treeId: string, entityId: string) {
  return sendListCustomEntityPhotosConverted(treeId, entityId, new EmptyRequest())
}
