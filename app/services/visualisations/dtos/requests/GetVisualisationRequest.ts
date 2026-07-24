import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class GetVisualisationRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
