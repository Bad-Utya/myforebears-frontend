import StatusResponseFactory from "~/composables/scripts/api/factories/StatusResponseFactory";
import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";
import type StatusResponse from "~/composables/scripts/api/dtos/StatusResponse";
import type StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";

const AbstractRealizations = {
  statusFactory: new StatusResponseFactory() as IResponseFactory<StatusDTO, StatusResponse>
}

type Dependencies = typeof AbstractRealizations

export default function getDependency<K extends keyof Dependencies>(key: K): Dependencies[K] {
  return AbstractRealizations[key]
}
