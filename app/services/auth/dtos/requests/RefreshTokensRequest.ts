import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class RefreshTokensRequest implements IApiRequest {
  refreshToken: string;

  constructor(refreshToken: string) {
    this.refreshToken = refreshToken;
  }

  toPayload() {
    return {refreshToken: this.refreshToken};
  }
}
