import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class ListRandomPublicCustomTreesRequest implements IApiRequest {
  constructor(public limit: number = 20) {}

  toPayload() {
    return {
      limit: this.limit
    }
  }
}
