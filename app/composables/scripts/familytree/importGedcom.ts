import { sendAsyncRawFetchRequest } from '~/composables/scripts/api/sendRawRequest'
import ImportGedcomRequest from '~/composables/scripts/familytree/dtos/requests/ImportGedcomRequest'
import ImportGedcomResponseFactory from '~/composables/scripts/familytree/factories/ImportGedcomResponseFactory'

export async function sendImportGedcomConverted(request: ImportGedcomRequest) {
  return sendAsyncRawFetchRequest('familytree/import/gedcom', request, new ImportGedcomResponseFactory(), 'POST')
}

export default async function sendImportGedcomRequest(gedcomContent: string) {
  return sendImportGedcomConverted(new ImportGedcomRequest(gedcomContent))
}
