import StatusResponseFactory from '~/services/api/factories/StatusResponseFactory'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import CustomTreeEmailRequest from '~/services/customTrees/dtos/requests/CustomTreeEmailRequest'

export async function sendAddCustomTreeAccessEmailConverted(treeId: string, request: CustomTreeEmailRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}/access-emails`, request, new StatusResponseFactory(), 'POST')
}

export default async function sendAddCustomTreeAccessEmailRequest(treeId: string, email: string) {
  return sendAddCustomTreeAccessEmailConverted(treeId, new CustomTreeEmailRequest(email))
}
