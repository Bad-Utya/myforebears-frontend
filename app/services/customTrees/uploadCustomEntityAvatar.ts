import { sendAsyncDefaultFetchRequest } from '~/services/api/sendDefaultRequest'
import UploadCustomEntityAvatarRequest from '~/services/customTrees/dtos/requests/UploadCustomEntityAvatarRequest'
import CustomPhotoResponseFactory from '~/services/customTrees/factories/CustomPhotoResponseFactory'

export async function sendUploadCustomEntityAvatarConverted(
  treeId: string,
  entityId: string,
  request: UploadCustomEntityAvatarRequest
) {
  return sendAsyncDefaultFetchRequest(
    `custom-trees/${treeId}/entities/${entityId}/avatar`,
    request,
    new CustomPhotoResponseFactory(),
    'POST'
  )
}

export default async function sendUploadCustomEntityAvatarRequest(
  treeId: string,
  entityId: string,
  file: File
) {
  return sendUploadCustomEntityAvatarConverted(treeId, entityId, new UploadCustomEntityAvatarRequest(file))
}
