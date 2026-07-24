import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import ExportPublicPersonRequest from '~/services/publicPersons/dtos/requests/ExportPublicPersonRequest'
import GetPublicPersonResponseFactory from '~/services/publicPersons/factories/GetPublicPersonResponseFactory'

export async function sendExportPublicPersonConverted(request: ExportPublicPersonRequest) {
  return sendAsyncDefaultFetchRequest('public-persons/export', request, new GetPublicPersonResponseFactory(), 'POST')
}

export default async function sendExportPublicPersonRequest(treeId: string, personId: string) {
  return sendExportPublicPersonConverted(new ExportPublicPersonRequest(treeId, personId))
}
