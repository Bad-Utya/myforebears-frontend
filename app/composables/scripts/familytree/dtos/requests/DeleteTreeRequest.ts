import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class DeleteTreeRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
