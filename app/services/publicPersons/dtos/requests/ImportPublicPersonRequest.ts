import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class ImportPublicPersonRequest implements IApiRequest {
  constructor(
    public tree_id: string,
    public attachment: string,
    public attach_to_person_id?: string
  ) {}

  toPayload() {
    return {
      tree_id: this.tree_id,
      attachment: this.attachment,
      attach_to_person_id: this.attach_to_person_id
    }
  }
}
