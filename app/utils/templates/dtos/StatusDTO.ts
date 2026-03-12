export default class StatusDTO {
  isSuccessful: boolean;
  message?: string;

  constructor(isSuccessful: boolean, message?: string) {
    this.isSuccessful = isSuccessful;
    if (message) {
      this.message = message;
    }
  }
}
