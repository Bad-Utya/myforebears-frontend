import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class RenderCoordinatesForClientRequest implements IApiRequest {
  root_person_id?: string;
  max_depth?: number;

  constructor(rootPersonId?: string, maxDepth?: number) {
    this.root_person_id = rootPersonId;
    this.max_depth = maxDepth;
  }

  toPayload() {
    return {
      root_person_id: this.root_person_id,
      max_depth: this.max_depth,
    };
  }
}
