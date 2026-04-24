import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import UploadPersonAvatarRequest from "~/composables/scripts/photos/dtos/requests/UploadPersonAvatarRequest";
import UploadPersonAvatarResponseFactory from "~/composables/scripts/photos/factories/UploadPersonAvatarResponseFactory";

export async function sendUploadPersonAvatarConverted(treeId: string, personId: string, request: UploadPersonAvatarRequest) {
  return sendAsyncDefaultFetchRequest(`photos/${treeId}/persons/${personId}/avatar`, request, new UploadPersonAvatarResponseFactory(), 'POST');
}

export default async function sendUploadPersonAvatarRequest(treeId: string, personId: string, file: File) {
  return sendUploadPersonAvatarConverted(treeId, personId, new UploadPersonAvatarRequest(file));
}
