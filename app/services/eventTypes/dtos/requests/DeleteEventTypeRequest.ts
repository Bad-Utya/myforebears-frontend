import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class DeleteEventTypeRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
