import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";
import LoginDTO from "~/composables/scripts/auth/dtos/inner/LoginDTO";
import type LoginResponse from "~/composables/scripts/auth/dtos/responses/LoginResponse";

export default class LoginResponseFactory implements IResponseFactory<LoginDTO, LoginResponse> {

  // TODO remove this func
  getNoConnectionErrorDTO(): LoginDTO {
    return new LoginDTO(undefined, undefined, 'error.no_connection');
  }

  // TODO wtf)
  createDTO(fetchResponse: LoginResponse): LoginDTO {
    const accessToken = fetchResponse.accessToken ?? fetchResponse.access_token;
    const refreshToken = fetchResponse.refreshToken ?? fetchResponse.refresh_token;
    return new LoginDTO(accessToken, refreshToken);
  }
}
