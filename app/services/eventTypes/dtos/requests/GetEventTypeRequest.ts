import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class GetEventTypeRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
