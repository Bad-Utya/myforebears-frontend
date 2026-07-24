import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class CustomTreeEmailRequest implements IApiRequest {
  constructor(public email: string) {}

  toPayload() {
    return {
      email: this.email
    }
  }
}
