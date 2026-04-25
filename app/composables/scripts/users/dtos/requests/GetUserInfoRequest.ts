import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class GetUserInfoRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
