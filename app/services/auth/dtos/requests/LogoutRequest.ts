import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class LogoutRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
