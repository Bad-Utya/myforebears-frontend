import type IApiRequest from '~/composables/scripts/api/interfaces/IApiRequest'

export default class ImportGedcomRequest implements IApiRequest {
  gedcom_content: string

  constructor(gedcomContent: string) {
    this.gedcom_content = gedcomContent
  }

  toPayload() {
    return this.gedcom_content
  }
}
