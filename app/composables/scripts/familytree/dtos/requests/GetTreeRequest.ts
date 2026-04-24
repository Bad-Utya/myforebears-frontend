import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class GetTreeRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
