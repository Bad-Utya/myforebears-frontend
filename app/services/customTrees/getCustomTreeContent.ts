import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import GetCustomTreeContentResponseFactory from '~/services/customTrees/factories/GetCustomTreeContentResponseFactory'

export async function sendGetCustomTreeContentConverted(treeId: string, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(
    `custom-trees/${treeId}/content`,
    request,
    new GetCustomTreeContentResponseFactory(),
    'GET'
  )
}

export default async function sendGetCustomTreeContentRequest(treeId: string) {
  return sendGetCustomTreeContentConverted(treeId, new EmptyRequest())
}
