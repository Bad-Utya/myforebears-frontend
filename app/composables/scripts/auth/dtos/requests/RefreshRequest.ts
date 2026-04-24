import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class RefreshRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
