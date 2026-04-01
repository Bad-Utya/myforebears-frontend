import code from "~/pages/auth/code.vue";
import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class CodeRequest implements IApiRequest {
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
