import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";
import RefreshTokensDTO from "~/composables/scripts/auth/dtos/inner/RefreshTokensDTO";
import type RefreshTokensResponse from "~/composables/scripts/auth/dtos/responses/RefreshTokensResponse";
import type LoginResponse from "~/composables/scripts/auth/dtos/responses/LoginResponse";
import type LoginDTO from "~/composables/scripts/auth/dtos/inner/LoginDTO";

export default class LoginResponseFactory implements IResponseFactory<LoginDTO, LoginResponse> {
    getNoConnectionErrorDTO(): RefreshTokensDTO {
      return new RefreshTokensDTO(undefined, undefined, 'error.no_connection');
    }
    createDTO(fetchResponse: RefreshTokensResponse): RefreshTokensDTO {
      return new RefreshTokensDTO(fetchResponse.refreshToken, fetchResponse.refreshToken);
    }
}
