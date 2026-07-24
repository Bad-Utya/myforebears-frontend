import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import DeletePhotoRequest from "~/services/photos/dtos/requests/DeletePhotoRequest";
import DeletePhotoResponseFactory from "~/services/photos/factories/DeletePhotoResponseFactory";

export async function sendDeletePhotoConverted(treeId: string, photoId: string, request: DeletePhotoRequest) {
  return sendAsyncDefaultFetchRequest(`photos/${treeId}/${photoId}`, request, new DeletePhotoResponseFactory(), 'DELETE');
}

export default async function sendDeletePhotoRequest(treeId: string, photoId: string) {
  return sendDeletePhotoConverted(treeId, photoId, new DeletePhotoRequest());
}
