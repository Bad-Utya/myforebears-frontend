import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";
import type RefreshTokensRequest from "~/composables/scripts/auth/dtos/requests/RefreshTokensRequest";
import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";
import RefreshTokensDTO from "~/composables/scripts/auth/dtos/inner/RefreshTokensDTO";
import type RefreshTokensResponse from "~/composables/scripts/auth/dtos/responses/RefreshTokensResponse";

export default class RefreshTokensResponseFactory implements IResponseFactory<RefreshTokensDTO, RefreshTokensResponse>{
  getNoConnectionErrorDTO(): RefreshTokensDTO {
    return new RefreshTokensDTO(undefined, undefined, 'error.no_connection');
  }

  createDTO(fetchResponse: RefreshTokensResponse): RefreshTokensDTO {
    return new RefreshTokensDTO(fetchResponse.refreshToken, fetchResponse.refreshToken);
  }
}
