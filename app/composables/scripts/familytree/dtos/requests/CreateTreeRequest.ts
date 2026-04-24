import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class CreateTreeRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
