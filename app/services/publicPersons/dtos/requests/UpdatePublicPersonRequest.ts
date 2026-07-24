import type IApiRequest from '~/services/api/interfaces/IApiRequest'

type PublicPersonEventInput = {
  id?: string
  event_type_id?: string
  date_iso?: string
  date_bound?: string
  date_precision?: string
  date_unknown?: boolean
}

export default class UpdatePublicPersonRequest implements IApiRequest {
  constructor(
    public first_name?: string,
    public last_name?: string,
    public patronymic?: string,
    public gender?: string,
    public biography?: string,
    public events?: PublicPersonEventInput[]
  ) {}

  toPayload() {
    return {
      first_name: this.first_name,
      last_name: this.last_name,
      patronymic: this.patronymic,
      gender: this.gender,
      biography: this.biography,
      events: this.events
    }
  }
}
