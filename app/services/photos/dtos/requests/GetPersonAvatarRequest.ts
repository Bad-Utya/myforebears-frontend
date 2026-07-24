import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class GetPersonAvatarRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
