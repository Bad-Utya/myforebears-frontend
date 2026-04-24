import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class ListTreeAccessEmailsRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
