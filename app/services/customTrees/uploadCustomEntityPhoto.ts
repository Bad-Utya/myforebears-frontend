import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import UploadCustomEntityPhotoRequest from '~/services/customTrees/dtos/requests/UploadCustomEntityPhotoRequest'
import CustomPhotoResponseFactory from '~/services/customTrees/factories/CustomPhotoResponseFactory'

export async function sendUploadCustomEntityPhotoConverted(
  treeId: string,
  entityId: string,
  request: UploadCustomEntityPhotoRequest
) {
  return sendAsyncDefaultFetchRequest(
    `custom-trees/${treeId}/entities/${entityId}/photos`,
    request,
    new CustomPhotoResponseFactory(),
    'POST'
  )
}

export default async function sendUploadCustomEntityPhotoRequest(
  treeId: string,
  entityId: string,
  file: File
) {
  return sendUploadCustomEntityPhotoConverted(treeId, entityId, new UploadCustomEntityPhotoRequest(file))
}
