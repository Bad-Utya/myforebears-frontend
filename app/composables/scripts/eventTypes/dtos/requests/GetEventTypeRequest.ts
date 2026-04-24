import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class GetEventTypeRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
