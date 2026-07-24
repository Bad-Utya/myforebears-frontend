import buildQueryString from '~/services/api/buildQueryString'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import CustomTreeCoordinatesRequest from '~/services/customTrees/dtos/requests/CustomTreeCoordinatesRequest'
import GetCustomTreeCoordinatesResponseFactory from '~/services/customTrees/factories/GetCustomTreeCoordinatesResponseFactory'

export async function sendGetCustomTreeCoordinatesConverted(treeId: string, request: CustomTreeCoordinatesRequest) {
  const query = buildQueryString({ root_entity_id: request.root_entity_id })
  const path = query ? `custom-trees/${treeId}/coordinates?${query}` : `custom-trees/${treeId}/coordinates`

  return sendAsyncDefaultFetchRequest(
    path,
    request,
    new GetCustomTreeCoordinatesResponseFactory(),
    'GET'
  )
}

export default async function sendGetCustomTreeCoordinatesRequest(treeId: string, rootEntityId?: string) {
  return sendGetCustomTreeCoordinatesConverted(treeId, new CustomTreeCoordinatesRequest(rootEntityId))
}
