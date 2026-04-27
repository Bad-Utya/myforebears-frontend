import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class CreateVisualisationRequest implements IApiRequest {
  root_person_id?: string;
  included_person_ids?: string[];

  constructor(rootPersonId?: string, includedPersonIds?: string[]) {
    this.root_person_id = rootPersonId;
    this.included_person_ids = includedPersonIds;
  }

  toPayload() {
    return {
      root_person_id: this.root_person_id,
      included_person_ids: this.included_person_ids,
    };
  }
}
