import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class GetEventRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
