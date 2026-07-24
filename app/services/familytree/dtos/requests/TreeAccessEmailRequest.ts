import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class TreeAccessEmailRequest implements IApiRequest {
  email: string;

  constructor(email: string) {
    this.email = email;
  }

  toPayload() {
    return {email: this.email};
  }
}
