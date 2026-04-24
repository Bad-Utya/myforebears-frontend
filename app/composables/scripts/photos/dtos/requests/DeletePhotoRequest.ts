import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class DeletePhotoRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
