import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import UploadEventPhotoRequest from "~/composables/scripts/photos/dtos/requests/UploadEventPhotoRequest";
import UploadEventPhotoResponseFactory from "~/composables/scripts/photos/factories/UploadEventPhotoResponseFactory";

export async function sendUploadEventPhotoConverted(treeId: string, eventId: string, request: UploadEventPhotoRequest) {
  return sendAsyncDefaultFetchRequest(`photos/${treeId}/events/${eventId}`, request, new UploadEventPhotoResponseFactory(), 'POST');
}

export default async function sendUploadEventPhotoRequest(treeId: string, eventId: string, file: File) {
  return sendUploadEventPhotoConverted(treeId, eventId, new UploadEventPhotoRequest(file));
}
