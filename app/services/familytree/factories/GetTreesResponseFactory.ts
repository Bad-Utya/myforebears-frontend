import DataResponseFactory from '~/services/api/factories/DataResponseFactory'
import type { ListTreesResponse } from '~/services/familytree/dtos/responses/ListTreesResponse'

export default class GetTreesResponseFactory extends DataResponseFactory<ListTreesResponse> {}
