import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class AddParentRequest implements IApiRequest {
  child_id: string;
  first_name: string;
  last_name: string;
  patronymic: string;
  role: string;

  constructor(childId: string, firstName: string, lastName: string, patronymic: string, role: string) {
    this.child_id = childId;
    this.first_name = firstName;
    this.last_name = lastName;
    this.patronymic = patronymic;
    this.role = role;
  }

  toPayload() {
    return {
      child_id: this.child_id,
      first_name: this.first_name,
      last_name: this.last_name,
      patronymic: this.patronymic,
      role: this.role,
    };
  }
}
