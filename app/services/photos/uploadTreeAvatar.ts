import {sendAsyncDefaultFetchRequest, type HttpRequestType} from "~/services/api/sendDefaultRequest";
import UploadTreeAvatarRequest from "~/services/photos/dtos/requests/UploadTreeAvatarRequest";
import UploadTreeAvatarResponseFactory from "~/services/photos/factories/UploadTreeAvatarResponseFactory";

export async function sendUploadTreeAvatarConverted(treeId: string, request: UploadTreeAvatarRequest, type: Extract<HttpRequestType, 'POST' | 'PUT'> = 'PUT') {
  return sendAsyncDefaultFetchRequest(`photos/${treeId}/avatar`, request, new UploadTreeAvatarResponseFactory(), type);
}

export default async function sendUploadTreeAvatarRequest(treeId: string, file: File, type: 'POST' | 'PUT' = 'PUT') {
  return sendUploadTreeAvatarConverted(treeId, new UploadTreeAvatarRequest(file), type);
}
