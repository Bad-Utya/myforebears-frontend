import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import CreateCustomTreeRequest from '~/services/customTrees/dtos/requests/CreateCustomTreeRequest'
import GetCustomTreeResponseFactory from '~/services/customTrees/factories/GetCustomTreeResponseFactory'

export async function sendCreateCustomTreeConverted(request: CreateCustomTreeRequest) {
  return sendAsyncDefaultFetchRequest('custom-trees/', request, new GetCustomTreeResponseFactory(), 'POST')
}

export default async function sendCreateCustomTreeRequest(
  name?: string,
  description?: string,
  rootEntityName?: string,
  relationUp?: string,
  relationDown?: string
) {
  return sendCreateCustomTreeConverted(
    new CreateCustomTreeRequest(name, description, rootEntityName, relationUp, relationDown)
  )
}
