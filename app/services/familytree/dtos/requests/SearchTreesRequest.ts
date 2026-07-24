import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class SearchTreesRequest implements IApiRequest {
  constructor(
    public name: string,
    public limit: number = 10
  ) {
  }

  toPayload() {
    return {
      name: this.name,
      limit: this.limit
    }
  }
}
