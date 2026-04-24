import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class GetPersonAvatarRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
