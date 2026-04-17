import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class ResetPasswordByLinkRequest implements IApiRequest {
  code: string;
  newPassword: string;

  constructor(code: string, newPassword: string) {
    this.code = code;
    this.newPassword = newPassword;
  }

  toPayload(): {} {
        return {code: this.code, newPassword: this.newPassword};
    }
}
