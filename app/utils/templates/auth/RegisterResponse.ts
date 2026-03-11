export default class RegisterResponse {
  code: string;

  constructor(payload: {code: string}) {
    this.code = payload.code;
  }
}
