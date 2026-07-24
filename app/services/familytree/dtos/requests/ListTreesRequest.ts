import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class ListTreesRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
