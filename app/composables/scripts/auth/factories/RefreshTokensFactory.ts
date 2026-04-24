import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";
import RefreshTokensDTO from "~/composables/scripts/auth/dtos/inner/RefreshTokensDTO";
import type RefreshTokensResponse from "~/composables/scripts/auth/dtos/responses/RefreshTokensResponse";

export default class RefreshTokensResponseFactory implements IResponseFactory<RefreshTokensDTO, RefreshTokensResponse>{
  getNoConnectionErrorDTO(): RefreshTokensDTO {
    return new RefreshTokensDTO(undefined, undefined, 'error.no_connection');
  }

  createDTO(fetchResponse: RefreshTokensResponse): RefreshTokensDTO {
    const accessToken = fetchResponse.accessToken ?? fetchResponse.access_token;
    const refreshToken = fetchResponse.refreshToken ?? fetchResponse.refresh_token;
    return new RefreshTokensDTO(accessToken, refreshToken);
  }
}
