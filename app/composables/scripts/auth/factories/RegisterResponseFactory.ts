import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";
import LoginDTO from "~/composables/scripts/auth/dtos/inner/LoginDTO";
import type RegisterResponse from "~/composables/scripts/auth/dtos/responses/RegisterResponse";

export default class RegisterResponseFactory implements IResponseFactory<LoginDTO, RegisterResponse> {
  getNoConnectionErrorDTO(): LoginDTO {
    return new LoginDTO(undefined, undefined, 'error.no_connection');
  }

  createDTO(fetchResponse: RegisterResponse): LoginDTO {
    const accessToken = fetchResponse.access_token;
    const refreshToken = fetchResponse.refresh_token;
    return new LoginDTO(accessToken, refreshToken);
  }
}
