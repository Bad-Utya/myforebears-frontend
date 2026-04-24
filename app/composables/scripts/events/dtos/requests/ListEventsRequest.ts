import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class ListEventsRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
