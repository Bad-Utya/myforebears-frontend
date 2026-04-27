import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class DeleteVisualisationRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
