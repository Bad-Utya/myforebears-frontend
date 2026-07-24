export default class FetchResponse<TResponseType> {
  data: TResponseType;
  error?: string;
  message?: string;

  constructor(data: TResponseType, error?: string, message?: string) {
    this.data = data;

    if (error) {
      this.error = error;
    }

    if (message) {
      this.message = message;
    }
  }
}
