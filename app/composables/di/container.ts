import StatusResponseFactory from "~/composables/scripts/api/factories/StatusResponseFactory";
import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";
import type StatusResponse from "~/composables/scripts/api/dtos/StatusResponse";
import type StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";
import RefreshTokensFactory from "~/composables/scripts/auth/factories/RefreshTokensFactory";
import type RefreshTokensDTO from "~/composables/scripts/auth/dtos/inner/RefreshTokensDTO";
import type RefreshTokensResponse from "~/composables/scripts/auth/dtos/responses/RefreshTokensResponse";
import type LoginResponse from "~/composables/scripts/auth/dtos/responses/LoginResponse";
import LoginResponseFactory from "~/composables/scripts/auth/factories/LoginResponseFactory";
import type LoginDTO from "~/composables/scripts/auth/dtos/inner/LoginDTO";
import RefreshTokensResponseFactory from "~/composables/scripts/auth/factories/RefreshTokensFactory";

const AbstractRealizations = {
  statusFactory: new StatusResponseFactory() as IResponseFactory<StatusDTO, StatusResponse>,
  loginFactory: new LoginResponseFactory() as IResponseFactory<LoginDTO, LoginResponse>,
  refreshTokenFactory: new RefreshTokensResponseFactory() as IResponseFactory<RefreshTokensDTO, RefreshTokensResponse>,
}

type Dependencies = typeof AbstractRealizations

export default function getDependency<K extends keyof Dependencies>(key: K): Dependencies[K] {
  return AbstractRealizations[key]
}
