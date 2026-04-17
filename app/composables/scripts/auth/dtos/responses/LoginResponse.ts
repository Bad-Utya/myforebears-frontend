import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";
import StatusResponse from "~/composables/scripts/api/dtos/StatusResponse";

export default class LoginResponse extends StatusResponse {
  accessToken?: string;
  refreshToken?: string;
}
