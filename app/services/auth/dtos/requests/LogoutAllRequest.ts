import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class LogoutAllRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
