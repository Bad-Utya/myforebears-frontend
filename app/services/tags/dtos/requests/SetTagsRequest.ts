import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class SetTagsRequest implements IApiRequest {
  constructor(public tag_codes: string[]) {}

  toPayload() {
    return {
      tag_codes: this.tag_codes
    }
  }
}
