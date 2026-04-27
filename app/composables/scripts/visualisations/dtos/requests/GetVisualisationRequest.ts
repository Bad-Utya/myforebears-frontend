import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class GetVisualisationRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
