import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class GetPhotoRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
