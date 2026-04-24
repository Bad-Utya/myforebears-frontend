import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class ListPersonsRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
