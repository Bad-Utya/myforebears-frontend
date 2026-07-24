import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class ListEventTypesRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
