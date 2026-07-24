import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class CustomTreeCoordinatesRequest implements IApiRequest {
  constructor(public root_entity_id?: string) {}

  toPayload() {
    return {
      root_entity_id: this.root_entity_id
    }
  }
}
