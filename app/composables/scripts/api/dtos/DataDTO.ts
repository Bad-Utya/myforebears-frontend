import StatusDTO from "~/composables/scripts/api/dtos/StatusDTO";

export default class DataDTO<TData> extends StatusDTO {
  data?: TData;

  constructor(isSuccessful: boolean, data?: TData, message?: string) {
    super(isSuccessful, message);
    this.data = data;
  }
}
