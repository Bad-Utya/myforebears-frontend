import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class GetTreeContentRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
