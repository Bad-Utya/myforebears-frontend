import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class CustomTreeParentRequest implements IApiRequest {
  constructor(
    public child_id: string,
    public name?: string,
    public description?: string
  ) {}

  toPayload() {
    return {
      child_id: this.child_id,
      name: this.name,
      description: this.description
    }
  }
}
