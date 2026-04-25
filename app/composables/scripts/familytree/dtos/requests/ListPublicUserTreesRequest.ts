import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class ListPublicUserTreesRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
