import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class CreateTreeRequest implements IApiRequest {
  name?: string;
  description?: string;

  constructor(name?: string, description?: string) {
    this.name = name;
    this.description = description;
  }

  toPayload() {
    return {
      name: this.name,
      description: this.description,
    };
  }
}
