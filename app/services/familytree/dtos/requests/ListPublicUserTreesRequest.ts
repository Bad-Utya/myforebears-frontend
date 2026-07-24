import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class ListPublicUserTreesRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
