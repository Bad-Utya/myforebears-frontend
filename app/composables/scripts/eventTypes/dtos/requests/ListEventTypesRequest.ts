import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class ListEventTypesRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
