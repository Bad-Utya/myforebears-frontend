import type IResponseFactory from "~/services/api/interfaces/IResponseFactory";
import LoginDTO from "~/services/auth/dtos/inner/LoginDTO";
import type RegisterResponse from "~/services/auth/dtos/responses/RegisterResponse";

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
