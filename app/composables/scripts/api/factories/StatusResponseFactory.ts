import type IResponseFactory from "~/composables/scripts/api/interfaces/IResponseFactory";
import StatusResponse from "~/composables/scripts/api/dtos/StatusResponse";
import StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";

export default class StatusResponseFactory implements IResponseFactory<StatusDTO, StatusResponse> {
    getNoConnectionErrorDTO(): StatusDTO {
      return new StatusDTO(false, "No connection to the server");
    }

    createDTO(response: StatusResponse): StatusDTO {
      if (response.status === 'ok') {
        return new StatusDTO(true);
      } else {
        return new StatusDTO(false, "Something got wrong, try again later");
      }
    }
}
