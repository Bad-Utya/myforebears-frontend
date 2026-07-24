import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class DeletePhotoRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
