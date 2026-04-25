import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class UpdateMyNicknameRequest implements IApiRequest {
  nickname: string;

  constructor(nickname: string) {
    this.nickname = nickname;
  }

  toPayload() {
    return {nickname: this.nickname};
  }
}
