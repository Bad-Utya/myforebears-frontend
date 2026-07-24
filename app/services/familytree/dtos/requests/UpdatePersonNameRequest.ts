import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class UpdatePersonNameRequest implements IApiRequest {
  first_name: string;
  last_name: string;
  patronymic: string;

  constructor(firstName: string, lastName: string, patronymic: string) {
    this.first_name = firstName;
    this.last_name = lastName;
    this.patronymic = patronymic;
  }

  toPayload() {
    return {
      first_name: this.first_name,
      last_name: this.last_name,
      patronymic: this.patronymic,
    };
  }
}
