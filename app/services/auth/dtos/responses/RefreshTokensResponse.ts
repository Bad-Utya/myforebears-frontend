import StatusResponse from "~/services/api/dtos/StatusResponse";

export default class RefreshTokensResponse extends StatusResponse {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
}
