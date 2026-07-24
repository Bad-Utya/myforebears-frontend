import { sendAsyncRawFetchRequest } from '~/services/api/sendRawRequest'
import ImportGedcomRequest from '~/services/familytree/dtos/requests/ImportGedcomRequest'
import ImportGedcomResponseFactory from '~/services/familytree/factories/ImportGedcomResponseFactory'

export async function sendImportGedcomConverted(request: ImportGedcomRequest) {
  return sendAsyncRawFetchRequest('familytree/import/gedcom', request, new ImportGedcomResponseFactory(), 'POST')
}

export default async function sendImportGedcomRequest(gedcomContent: string) {
  return sendImportGedcomConverted(new ImportGedcomRequest(gedcomContent))
}
