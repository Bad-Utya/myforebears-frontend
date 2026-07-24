import buildQueryString from '~/services/api/buildQueryString'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import SearchTreesRequest from '~/services/familytree/dtos/requests/SearchTreesRequest'
import ListTreesResponseFactory from '~/services/familytree/factories/ListTreesResponseFactory'

export type SearchPublicTreesParams = {
  q?: string
  limit?: number
  tags?: string[]
}

function normalizeSearchPublicTreesParams(
  queryOrParams: string | SearchPublicTreesParams,
  limit: number = 10
) {
  if (typeof queryOrParams === 'string') {
    return new SearchTreesRequest(queryOrParams, limit)
  }

  return new SearchTreesRequest(
    queryOrParams.q ?? '',
    queryOrParams.limit ?? limit,
    queryOrParams.tags
  )
}

export async function sendSearchPublicTreesRequest(
  queryOrParams: string | SearchPublicTreesParams,
  limit: number = 10
) {
  const request = normalizeSearchPublicTreesParams(queryOrParams, limit)
  const query = buildQueryString({
    q: request.q,
    tags: request.tags,
    limit: request.limit
  })

  return sendAsyncDefaultFetchRequest(
    `familytree/public/search?${query}`,
    request,
    new ListTreesResponseFactory(),
    'GET'
  )
}
