import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import UploadUserAvatarRequest from "~/composables/scripts/photos/dtos/requests/UploadUserAvatarRequest";
import UploadUserAvatarResponseFactory from "~/composables/scripts/photos/factories/UploadUserAvatarResponseFactory";

export async function sendUploadUserAvatarConverted(request: UploadUserAvatarRequest) {
  return sendAsyncDefaultFetchRequest('photos/user/avatar', request, new UploadUserAvatarResponseFactory(), 'POST');
}

export default async function sendUploadUserAvatarRequest(file: File) {
  return sendUploadUserAvatarConverted(new UploadUserAvatarRequest(file));
}
