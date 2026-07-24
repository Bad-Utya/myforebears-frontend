import StatusResponseFactory from '~/services/api/factories/StatusResponseFactory'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import CustomTreeEmailRequest from '~/services/customTrees/dtos/requests/CustomTreeEmailRequest'

export async function sendDeleteCustomTreeAccessEmailConverted(treeId: string, request: CustomTreeEmailRequest) {
  return sendAsyncDefaultFetchRequest(`custom-trees/${treeId}/access-emails`, request, new StatusResponseFactory(), 'DELETE')
}

export default async function sendDeleteCustomTreeAccessEmailRequest(treeId: string, email: string) {
  return sendDeleteCustomTreeAccessEmailConverted(treeId, new CustomTreeEmailRequest(email))
}
