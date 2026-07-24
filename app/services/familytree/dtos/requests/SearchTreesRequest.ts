import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class SearchTreesRequest implements IApiRequest {
  constructor(
    public q: string,
    public limit: number = 10,
    public tags?: string[]
  ) {
  }

  toPayload() {
    return {
      q: this.q,
      limit: this.limit,
      tags: this.tags
    }
  }
}
