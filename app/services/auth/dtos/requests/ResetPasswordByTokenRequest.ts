import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class ResetPasswordByTokenRequest implements IApiRequest {
  password: string;

  constructor(password: string) {
    this.password = password;
  }

  toPayload() {
    return {password: this.password};
  }
}
