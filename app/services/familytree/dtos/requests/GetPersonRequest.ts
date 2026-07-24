import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class GetPersonRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
