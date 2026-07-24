import EmptyRequest from '~/services/api/requests/EmptyRequest'
import StatusResponseFactory from '~/services/api/factories/StatusResponseFactory'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'

export async function sendDeleteCustomTreeConverted(treeId: string, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}`, request, new StatusResponseFactory(), 'DELETE')
}

export default async function sendDeleteCustomTreeRequest(treeId: string) {
  return sendDeleteCustomTreeConverted(treeId, new EmptyRequest())
}
