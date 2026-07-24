import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class SearchUsersRequest implements IApiRequest {
  constructor(
    public username: string,
    public limit: number = 10
  ) {}

  toPayload() {
    return {
      username: this.username,
      limit: this.limit
    }
  }
}
