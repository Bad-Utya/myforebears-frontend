import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class GetMyUserInfoRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
