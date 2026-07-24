import type IApiRequest from "~/services/api/interfaces/IApiRequest";

export default class UploadPersonAvatarRequest implements IApiRequest {
  file: File;

  constructor(file: File) {
    this.file = file;
  }

  toPayload() {
    const formData = new FormData();
    formData.append('file', this.file);
    return formData;
  }
}
