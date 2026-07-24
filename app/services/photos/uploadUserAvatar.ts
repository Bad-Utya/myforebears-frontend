import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import UploadUserAvatarRequest from "~/services/photos/dtos/requests/UploadUserAvatarRequest";
import UploadUserAvatarResponseFactory from "~/services/photos/factories/UploadUserAvatarResponseFactory";

export async function sendUploadUserAvatarConverted(request: UploadUserAvatarRequest) {
  return sendAsyncDefaultFetchRequest('photos/user/avatar', request, new UploadUserAvatarResponseFactory(), 'POST');
}

export default async function sendUploadUserAvatarRequest(file: File) {
  return sendUploadUserAvatarConverted(new UploadUserAvatarRequest(file));
}
