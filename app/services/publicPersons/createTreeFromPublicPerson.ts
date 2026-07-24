import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import CreateTreeFromPublicPersonRequest from '~/services/publicPersons/dtos/requests/CreateTreeFromPublicPersonRequest'
import CreateTreeFromPublicPersonResponseFactory from '~/services/publicPersons/factories/CreateTreeFromPublicPersonResponseFactory'

export async function sendCreateTreeFromPublicPersonConverted(
  publicPersonId: string,
  request: CreateTreeFromPublicPersonRequest
) {
  return sendAsyncDefaultFetchRequest(
    `public-persons/${publicPersonId}/import-as-tree`,
    request,
    new CreateTreeFromPublicPersonResponseFactory(),
    'POST'
  )
}

export default async function sendCreateTreeFromPublicPersonRequest(publicPersonId: string, treeName?: string) {
  return sendCreateTreeFromPublicPersonConverted(publicPersonId, new CreateTreeFromPublicPersonRequest(treeName))
}
