import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export type UpdatePersonGenderValue = 'MALE' | 'FEMALE';

export default class UpdatePersonGenderRequest implements IApiRequest {
  gender: UpdatePersonGenderValue;

  constructor(gender: UpdatePersonGenderValue) {
    this.gender = gender;
  }

  toPayload() {
    return {
      gender: this.gender,
    };
  }
}
