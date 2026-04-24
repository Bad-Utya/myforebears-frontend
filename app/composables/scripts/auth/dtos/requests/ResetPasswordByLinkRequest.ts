import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class ResetPasswordByLinkRequest implements IApiRequest {
  link: string;
  password: string;

  constructor(link: string, password: string) {
    this.link = link;
    this.password = password;
  }

  toPayload() {
    return {link: this.link, password: this.password};
  }
}
