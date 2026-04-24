import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class LogoutAllRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
