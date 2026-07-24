import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class ListPersonsRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
