import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class GetTreeRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
