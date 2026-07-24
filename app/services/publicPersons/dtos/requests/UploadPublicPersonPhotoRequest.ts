import type IApiRequest from '~/services/api/interfaces/IApiRequest'

export default class UploadPublicPersonPhotoRequest implements IApiRequest {
  constructor(
    public file: File,
    public is_avatar?: boolean
  ) {}

  toPayload() {
    const formData = new FormData()
    formData.append('file', this.file)

    if (this.is_avatar !== undefined) {
      formData.append('is_avatar', String(this.is_avatar))
    }

    return formData
  }
}
