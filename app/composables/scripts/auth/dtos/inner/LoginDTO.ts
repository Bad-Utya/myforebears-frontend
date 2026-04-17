import StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";

export default class LoginDTO extends StatusDTO {
  accessToken?: string;
  refreshToken?: string;

  constructor(accessToken?: string, refreshToken?: string, message?: string) {
    super(accessToken !== null && refreshToken !== null, message);

    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
