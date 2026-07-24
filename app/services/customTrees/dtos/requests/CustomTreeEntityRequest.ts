import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class CustomTreeEntityRequest implements IApiRequest {
  constructor(
    public name?: string,
    public description?: string,
    public parent_id?: string
  ) {}

  toPayload() {
    return {
      name: this.name,
      description: this.description,
      parent_id: this.parent_id
    }
  }
}
