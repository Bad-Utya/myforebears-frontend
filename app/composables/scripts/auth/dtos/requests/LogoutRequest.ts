import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class LogoutRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
