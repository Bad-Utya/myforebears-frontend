import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class ListPersonPhotosRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
