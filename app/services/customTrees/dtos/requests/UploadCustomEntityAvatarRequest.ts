import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class UploadCustomEntityAvatarRequest implements IApiRequest {
  constructor(public file: File) {}

  toPayload() {
    const formData = new FormData()
    formData.append('file', this.file)
    return formData
  }
}
