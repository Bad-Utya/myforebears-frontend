import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class ExportGedcomRequest implements IApiRequest {
  toPayload() {
    return {}
  }
}
