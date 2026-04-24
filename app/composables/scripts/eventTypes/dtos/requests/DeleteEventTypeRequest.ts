import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class DeleteEventTypeRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
