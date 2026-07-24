import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class DeletePersonRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
