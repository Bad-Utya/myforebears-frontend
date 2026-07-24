import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import UploadEventPhotoRequest from "~/services/photos/dtos/requests/UploadEventPhotoRequest";
import UploadEventPhotoResponseFactory from "~/services/photos/factories/UploadEventPhotoResponseFactory";

export async function sendUploadEventPhotoConverted(treeId: string, eventId: string, request: UploadEventPhotoRequest) {
  return sendAsyncDefaultFetchRequest(`photos/${treeId}/events/${eventId}`, request, new UploadEventPhotoResponseFactory(), 'POST');
}

export default async function sendUploadEventPhotoRequest(treeId: string, eventId: string, file: File) {
  return sendUploadEventPhotoConverted(treeId, eventId, new UploadEventPhotoRequest(file));
}
