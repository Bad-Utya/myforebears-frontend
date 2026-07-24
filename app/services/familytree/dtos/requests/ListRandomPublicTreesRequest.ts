import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class ListRandomPublicTreesRequest implements IApiRequest {
  limit: number;

  constructor(limit: number) {
    this.limit = limit;
  }

  toPayload() {
    return {limit: this.limit};
  }
}
