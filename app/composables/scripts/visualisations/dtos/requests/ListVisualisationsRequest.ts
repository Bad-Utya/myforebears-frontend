import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class ListVisualisationsRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
