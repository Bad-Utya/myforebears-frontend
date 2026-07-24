import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class GetTreeContentRequest implements IApiRequest {
  toPayload() {
    return {};
  }
}
