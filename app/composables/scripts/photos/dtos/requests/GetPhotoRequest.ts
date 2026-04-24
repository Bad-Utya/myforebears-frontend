import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class GetPhotoRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
