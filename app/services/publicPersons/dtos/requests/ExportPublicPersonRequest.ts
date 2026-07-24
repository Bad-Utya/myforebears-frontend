import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class ExportPublicPersonRequest implements IApiRequest {
  constructor(
    public tree_id: string,
    public person_id: string
  ) {}

  toPayload() {
    return {
      tree_id: this.tree_id,
      person_id: this.person_id
    }
  }
}
