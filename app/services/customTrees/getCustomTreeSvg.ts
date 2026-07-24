import EmptyRequest from '~/services/api/requests/EmptyRequest'
import buildQueryString from '~/services/api/buildQueryString'
import { sendAsyncBinaryFetchRequest } from '~/services/api/sendBinaryRequest'

export async function sendGetCustomTreeSvgConverted(treeId: string, rootEntityId: string | undefined, _request: EmptyRequest) {
  const query = buildQueryString({ root_entity_id: rootEntityId })
  const path = query ? `custom-trees/${treeId}/svg?${query}` : `custom-trees/${treeId}/svg`

  return sendAsyncBinaryFetchRequest(path, 'GET')
}

export default async function sendGetCustomTreeSvgRequest(treeId: string, rootEntityId?: string) {
  return sendGetCustomTreeSvgConverted(treeId, rootEntityId, new EmptyRequest())
}
