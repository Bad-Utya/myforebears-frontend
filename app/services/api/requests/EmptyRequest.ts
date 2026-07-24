import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class EmptyRequest implements IApiRequest {
  toPayload() {
    return {}
  }
}
