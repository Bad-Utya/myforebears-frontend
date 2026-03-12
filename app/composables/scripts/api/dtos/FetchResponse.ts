export default class FetchResponse<TResponseType> {
  data: TResponseType;

  constructor(data: TResponseType) {
    this.data = data;
  }
}
