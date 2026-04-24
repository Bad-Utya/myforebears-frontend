import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class ListEventPhotosRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
