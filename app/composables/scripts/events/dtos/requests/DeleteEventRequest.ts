import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class DeleteEventRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
