import StatusResponse from "~/services/api/dtos/StatusResponse";

export default class RegisterResponse extends StatusResponse {
  access_token?: string;
  refresh_token?: string;
}
