import StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";

export default class LoginDTO extends StatusDTO {
  accessToken?: string;
  refreshToken?: string;

  constructor(accessToken?: string, refreshToken?: string, message?: string) {
    const hasAccessToken = typeof accessToken === 'string' && accessToken.length > 0;
    const hasRefreshToken = typeof refreshToken === 'string' && refreshToken.length > 0;
    super(hasAccessToken && hasRefreshToken, message);

    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
