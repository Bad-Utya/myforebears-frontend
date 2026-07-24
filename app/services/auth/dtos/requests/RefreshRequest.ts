import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class RefreshRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
