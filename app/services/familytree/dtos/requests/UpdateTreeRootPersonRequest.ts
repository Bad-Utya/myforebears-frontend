import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class UpdateTreeRootPersonRequest implements IApiRequest {
  root_person_id: string;

  constructor(rootPersonId: string) {
    this.root_person_id = rootPersonId;
  }

  // TODO: do i need it really? maybe i do lol
  toPayload() {
      return {root_person_id: this.root_person_id};
    }

}
