import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class UpdateCustomTreeRequest implements IApiRequest {
  constructor(
    public name?: string,
    public description?: string,
    public root_entity_id?: string,
    public relation_up?: string,
    public relation_down?: string,
    public is_public_on_main_page?: boolean,
    public is_view_restricted?: boolean
  ) {}

  toPayload() {
    return {
      name: this.name,
      description: this.description,
      root_entity_id: this.root_entity_id,
      relation_up: this.relation_up,
      relation_down: this.relation_down,
      is_public_on_main_page: this.is_public_on_main_page,
      is_view_restricted: this.is_view_restricted
    }
  }
}
