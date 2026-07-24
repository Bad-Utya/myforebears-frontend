import { sendAsyncTextFetchRequest } from '~/services/api/sendTextRequest'
import ExportGedcomRequest from '~/services/familytree/dtos/requests/ExportGedcomRequest'

export async function sendExportGedcomConverted(treeId: string, _request: ExportGedcomRequest) {
  return sendAsyncTextFetchRequest(`familytree/${treeId}/export/gedcom`, 'GET')
}

export default async function sendExportGedcomRequest(treeId: string) {
  return sendExportGedcomConverted(treeId, new ExportGedcomRequest())
}
