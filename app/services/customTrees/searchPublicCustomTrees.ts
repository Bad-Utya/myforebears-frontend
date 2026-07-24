import buildQueryString from '~/services/api/buildQueryString'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import SearchCustomTreesRequest from '~/services/customTrees/dtos/requests/SearchCustomTreesRequest'
import ListCustomTreesResponseFactory from '~/services/customTrees/factories/ListCustomTreesResponseFactory'

export type SearchPublicCustomTreesParams = {
  q?: string
  limit?: number
  tags?: string[]
}

function normalizeSearchPublicCustomTreesParams(
  queryOrParams: string | SearchPublicCustomTreesParams,
  limit: number = 20
) {
  if (typeof queryOrParams === 'string') {
    return new SearchCustomTreesRequest(queryOrParams, limit)
  }

  return new SearchCustomTreesRequest(
    queryOrParams.q,
    queryOrParams.limit ?? limit,
    queryOrParams.tags
  )
}

export async function sendSearchPublicCustomTreesRequest(
  queryOrParams: string | SearchPublicCustomTreesParams,
  limit: number = 20
) {
  const request = normalizeSearchPublicCustomTreesParams(queryOrParams, limit)
  const query = buildQueryString({
    q: request.q,
    tags: request.tags,
    limit: request.limit
  })

  return sendAsyncDefaultFetchRequest(
    `custom-trees/public/search?${query}`,
    request,
    new ListCustomTreesResponseFactory(),
    'GET'
  )
}
