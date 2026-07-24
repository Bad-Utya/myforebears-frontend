import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class AddPartnerRequest implements IApiRequest {
  person_id: string;
  first_name: string;
  last_name: string;
  patronymic: string;

  constructor(personId: string, firstName: string, lastName: string, patronymic: string) {
    this.person_id = personId;
    this.first_name = firstName;
    this.last_name = lastName;
    this.patronymic = patronymic;
  }

  toPayload() {
    return {
      person_id: this.person_id,
      first_name: this.first_name,
      last_name: this.last_name,
      patronymic: this.patronymic,
    };
  }
}
