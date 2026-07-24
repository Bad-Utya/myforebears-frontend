import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class ListVisualisationsRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
