import {sendAsyncBinaryFetchRequest} from "~/services/api/sendBinaryRequest";
import GetPhotoRequest from "~/services/photos/dtos/requests/GetPhotoRequest";

export async function sendGetPhotoConverted(treeId: string, photoId: string, _request: GetPhotoRequest) {
  return sendAsyncBinaryFetchRequest(`photos/${treeId}/${photoId}`, 'GET');
}

export default async function sendGetPhotoRequest(treeId: string, photoId: string) {
  return sendGetPhotoConverted(treeId, photoId, new GetPhotoRequest());
}
