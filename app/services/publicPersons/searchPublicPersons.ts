import buildQueryString from '~/services/api/buildQueryString'
import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import SearchPublicPersonsRequest from '~/services/publicPersons/dtos/requests/SearchPublicPersonsRequest'
import ListPublicPersonsResponseFactory from '~/services/publicPersons/factories/ListPublicPersonsResponseFactory'

export type SearchPublicPersonsParams = {
  q?: string
  limit?: number
  tags?: string[]
}

function normalizeSearchPublicPersonsParams(
  queryOrParams: string | SearchPublicPersonsParams,
  limit: number = 20
) {
  if (typeof queryOrParams === 'string') {
    return new SearchPublicPersonsRequest(queryOrParams, limit)
  }

  return new SearchPublicPersonsRequest(
    queryOrParams.q,
    queryOrParams.limit ?? limit,
    queryOrParams.tags
  )
}

export async function sendSearchPublicPersonsRequest(
  queryOrParams: string | SearchPublicPersonsParams,
  limit: number = 20
) {
  const request = normalizeSearchPublicPersonsParams(queryOrParams, limit)
  const query = buildQueryString({
    q: request.q,
    tags: request.tags,
    limit: request.limit
  })

  return sendAsyncDefaultFetchRequest(
    `public-persons/search?${query}`,
    request,
    new ListPublicPersonsResponseFactory(),
    'GET'
  )
}

export default async function sendSearchPublicPersonsRequestDefault(
  queryOrParams: string | SearchPublicPersonsParams,
  limit: number = 20
) {
  return sendSearchPublicPersonsRequest(queryOrParams, limit)
}
