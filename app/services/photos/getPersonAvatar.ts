import {sendAsyncBinaryFetchRequest} from "~/services/api/sendBinaryRequest";
import GetPersonAvatarRequest from "~/services/photos/dtos/requests/GetPersonAvatarRequest";

export async function sendGetPersonAvatarConverted(treeId: string, personId: string, _request: GetPersonAvatarRequest) {
  return sendAsyncBinaryFetchRequest(`photos/${treeId}/persons/${personId}/avatar`, 'GET');
}

export default async function sendGetPersonAvatarRequest(treeId: string, personId: string) {
  return sendGetPersonAvatarConverted(treeId, personId, new GetPersonAvatarRequest());
}
