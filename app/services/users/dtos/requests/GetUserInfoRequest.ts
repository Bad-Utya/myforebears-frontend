import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class GetUserInfoRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
