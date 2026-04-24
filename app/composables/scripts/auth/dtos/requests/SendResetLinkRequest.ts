import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class SendResetLinkRequest implements IApiRequest {
  email: string;

  constructor(email: string) {
    this.email = email;
  }

  toPayload() {
    return {email: this.email};
  }
}
