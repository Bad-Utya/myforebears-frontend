import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class CreateEventTypeRequest implements IApiRequest {
  name: string;
  primary_persons_count: number;
  primary_persons_mode: string;

  constructor(name: string, primaryPersonsCount: number, primaryPersonsMode: string) {
    this.name = name;
    this.primary_persons_count = primaryPersonsCount;
    this.primary_persons_mode = primaryPersonsMode;
  }

  toPayload() {
    return {
      name: this.name,
      primary_persons_count: this.primary_persons_count,
      primary_persons_mode: this.primary_persons_mode,
    };
  }
}
