import StatusResponse from "~/services/api/dtos/StatusResponse";

export default class LoginResponse extends StatusResponse {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
}
