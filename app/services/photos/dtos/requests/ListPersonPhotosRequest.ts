import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class ListPersonPhotosRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
