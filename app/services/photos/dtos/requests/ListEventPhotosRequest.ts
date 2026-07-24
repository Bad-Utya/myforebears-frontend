import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class ListEventPhotosRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
