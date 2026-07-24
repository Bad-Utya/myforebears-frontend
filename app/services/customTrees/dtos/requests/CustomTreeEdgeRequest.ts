import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class CustomTreeEdgeRequest implements IApiRequest {
  constructor(
    public child_id: string,
    public parent_id: string
  ) {}

  toPayload() {
    return {
      child_id: this.child_id,
      parent_id: this.parent_id
    }
  }
}
