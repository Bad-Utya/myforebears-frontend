import { sendAsyncTextFetchRequest } from '~/composables/scripts/api/sendTextRequest'
import ExportGedcomRequest from '~/composables/scripts/familytree/dtos/requests/ExportGedcomRequest'

export async function sendExportGedcomConverted(treeId: string, _request: ExportGedcomRequest) {
  return sendAsyncTextFetchRequest(`familytree/${treeId}/export/gedcom`, 'GET')
}

export default async function sendExportGedcomRequest(treeId: string) {
  return sendExportGedcomConverted(treeId, new ExportGedcomRequest())
}
