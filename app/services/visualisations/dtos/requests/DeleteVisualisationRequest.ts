import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class DeleteVisualisationRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
