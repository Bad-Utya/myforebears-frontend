import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class CreateCustomTreeRequest implements IApiRequest {
  constructor(
    public name?: string,
    public description?: string,
    public root_entity_name?: string,
    public relation_up?: string,
    public relation_down?: string
  ) {}

  toPayload() {
    return {
      name: this.name,
      description: this.description,
      root_entity_name: this.root_entity_name,
      relation_up: this.relation_up,
      relation_down: this.relation_down
    }
  }
}
