import StatusResponseFactory from "~/services/api/factories/StatusResponseFactory";
import type IResponseFactory from "~/services/api/interfaces/IResponseFactory";
import type StatusResponse from "~/services/api/dtos/StatusResponse";
import type StatusDTO from "~/services/api/dtos/StatusDTO";
import type RefreshTokensDTO from "~/services/auth/dtos/inner/RefreshTokensDTO";
import type RefreshTokensResponse from "~/services/auth/dtos/responses/RefreshTokensResponse";
import type LoginResponse from "~/services/auth/dtos/responses/LoginResponse";
import LoginResponseFactory from "~/services/auth/factories/LoginResponseFactory";
import type LoginDTO from "~/services/auth/dtos/inner/LoginDTO";
import RefreshTokensResponseFactory from "~/services/auth/factories/RefreshTokensFactory";
import type RegisterResponse from "~/services/auth/dtos/responses/RegisterResponse";
import RegisterResponseFactory from "~/services/auth/factories/RegisterResponseFactory";

const AbstractRealizations = {
  statusFactory: new StatusResponseFactory() as IResponseFactory<StatusDTO, StatusResponse>,
  loginFactory: new LoginResponseFactory() as IResponseFactory<LoginDTO, LoginResponse>,
  refreshTokenFactory: new RefreshTokensResponseFactory() as IResponseFactory<RefreshTokensDTO, RefreshTokensResponse>,
  registerFactory: new RegisterResponseFactory() as IResponseFactory<LoginDTO, RegisterResponse>,
}

type Dependencies = typeof AbstractRealizations

export default function getDependency<K extends keyof Dependencies>(key: K): Dependencies[K] {
  return AbstractRealizations[key]
}
