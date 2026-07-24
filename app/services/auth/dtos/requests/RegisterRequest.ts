import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class RegisterRequest implements IApiRequest {
  email: string;
  code: string;

  constructor(email: string, code: string) {
    this.email = email;
    this.code = code;
  }

  toPayload() {
    return {email: this.email, code: this.code}
  }
}
