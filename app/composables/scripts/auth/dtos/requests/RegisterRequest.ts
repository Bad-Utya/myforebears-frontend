import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class RegisterRequest implements IApiRequest {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  toPayload() {
    return {email: this.email, password: this.password}
  }
}
