import EmptyRequest from '~/services/api/requests/EmptyRequest'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ListCustomTreeAccessEmailsResponseFactory from '~/services/customTrees/factories/ListCustomTreeAccessEmailsResponseFactory'

export async function sendListCustomTreeAccessEmailsConverted(treeId: string, request: EmptyRequest) {
  return sendAsyncDefaultFetchRequest(
    `custom-trees/${treeId}/access-emails`,
    request,
    new ListCustomTreeAccessEmailsResponseFactory(),
    'GET'
  )
}

export default async function sendListCustomTreeAccessEmailsRequest(treeId: string) {
  return sendListCustomTreeAccessEmailsConverted(treeId, new EmptyRequest())
}
