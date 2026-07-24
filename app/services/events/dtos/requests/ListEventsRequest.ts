import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class ListEventsRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
