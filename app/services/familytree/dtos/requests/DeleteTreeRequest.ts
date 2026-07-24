import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class DeleteTreeRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
