import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class GetPersonRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
