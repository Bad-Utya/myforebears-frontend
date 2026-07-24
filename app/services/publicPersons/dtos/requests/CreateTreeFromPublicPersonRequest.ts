import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class CreateTreeFromPublicPersonRequest implements IApiRequest {
  constructor(public tree_name?: string) {}

  toPayload() {
    return {
      tree_name: this.tree_name
    }
  }
}
