import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class DeleteEventRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
