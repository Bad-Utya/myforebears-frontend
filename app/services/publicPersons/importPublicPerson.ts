import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ImportPublicPersonRequest from '~/services/publicPersons/dtos/requests/ImportPublicPersonRequest'
import ImportPublicPersonResponseFactory from '~/services/publicPersons/factories/ImportPublicPersonResponseFactory'

export async function sendImportPublicPersonConverted(publicPersonId: string, request: ImportPublicPersonRequest) {
  return sendAsyncDefaultFetchRequest(`public-persons/${publicPersonId}/import`, request, new ImportPublicPersonResponseFactory(), 'POST')
}

export default async function sendImportPublicPersonRequest(
  publicPersonId: string,
  treeId: string,
  attachment: string,
  attachToPersonId?: string
) {
  return sendImportPublicPersonConverted(
    publicPersonId,
    new ImportPublicPersonRequest(treeId, attachment, attachToPersonId)
  )
}
