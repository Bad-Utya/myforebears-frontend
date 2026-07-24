import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import UploadPersonPhotoRequest from "~/services/photos/dtos/requests/UploadPersonPhotoRequest";
import UploadPersonPhotoResponseFactory from "~/services/photos/factories/UploadPersonPhotoResponseFactory";

export async function sendUploadPersonPhotoConverted(treeId: string, personId: string, request: UploadPersonPhotoRequest) {
  return sendAsyncDefaultFetchRequest(`photos/${treeId}/persons/${personId}`, request, new UploadPersonPhotoResponseFactory(), 'POST');
}

export default async function sendUploadPersonPhotoRequest(treeId: string, personId: string, file: File) {
  return sendUploadPersonPhotoConverted(treeId, personId, new UploadPersonPhotoRequest(file));
}
