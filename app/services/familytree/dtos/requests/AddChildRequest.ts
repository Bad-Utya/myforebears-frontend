import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class AddChildRequest implements IApiRequest {
  first_name: string;
  last_name: string;
  patronymic: string;
  gender: string;
  parent1_id: string;
  parent2_id: string;

  constructor(
    firstName: string,
    lastName: string,
    patronymic: string,
    gender: string,
    parent1Id: string,
    parent2Id: string
  ) {
    this.first_name = firstName;
    this.last_name = lastName;
    this.patronymic = patronymic;
    this.gender = gender;
    this.parent1_id = parent1Id;
    this.parent2_id = parent2Id;
  }

  toPayload() {
    return {
      first_name: this.first_name,
      last_name: this.last_name,
      patronymic: this.patronymic,
      gender: this.gender,
      parent1_id: this.parent1_id,
      parent2_id: this.parent2_id,
    };
  }
}
