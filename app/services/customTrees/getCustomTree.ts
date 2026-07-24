import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import GetCustomTreeResponseFactory from '~/services/customTrees/factories/GetCustomTreeResponseFactory'

export async function sendGetCustomTreeConverted(treeId: string, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}`, request, new GetCustomTreeResponseFactory(), 'GET')
}

export default async function sendGetCustomTreeRequest(treeId: string) {
  return sendGetCustomTreeConverted(treeId, new EmptyRequest())
}
