import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class ListTreeAccessEmailsRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
