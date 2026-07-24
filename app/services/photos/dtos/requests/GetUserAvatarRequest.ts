import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class GetUserAvatarRequest implements IApiRequest {
  user_id: number;

  constructor(userId: number) {
    this.user_id = userId;
  }

  toPayload() {
    return {user_id: this.user_id};
  }
}
