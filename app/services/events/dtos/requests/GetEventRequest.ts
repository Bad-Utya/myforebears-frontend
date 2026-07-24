import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class GetEventRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
