import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class DeletePersonRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
