import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncBinaryFetchRequest } from '~/services/api/sendBinaryRequest'

export async function sendGetCustomEntityAvatarConverted(
  treeId: string,
  entityId: string,
  _request: EmptyRequest
) {
  return sendAsyncBinaryFetchRequest(`custom-trees/${treeId}/entities/${entityId}/avatar`, 'GET')
}

export default async function sendGetCustomEntityAvatarRequest(treeId: string, entityId: string) {
  return sendGetCustomEntityAvatarConverted(treeId, entityId, new EmptyRequest())
}
