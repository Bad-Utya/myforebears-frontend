import type IResponseFactory from "~/services/api/interfaces/IResponseFactory";
import RefreshTokensDTO from "~/services/auth/dtos/inner/RefreshTokensDTO";
import type RefreshTokensResponse from "~/services/auth/dtos/responses/RefreshTokensResponse";

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
