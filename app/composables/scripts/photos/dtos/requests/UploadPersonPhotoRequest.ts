import type IApiRequest from "~/composables/scripts/api/interfaces/IApiRequest";

export default class UploadPersonPhotoRequest implements IApiRequest {
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
