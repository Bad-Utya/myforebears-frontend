import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import ListPersonPhotosRequest from "~/composables/scripts/photos/dtos/requests/ListPersonPhotosRequest";
import ListPersonPhotosResponseFactory from "~/composables/scripts/photos/factories/ListPersonPhotosResponseFactory";

export async function sendListPersonPhotosConverted(treeId: string, personId: string, request: ListPersonPhotosRequest) {
  return sendAsyncDefaultFetchRequest(`photos/${treeId}/persons/${personId}`, request, new ListPersonPhotosResponseFactory(), 'GET');
}

export default async function sendListPersonPhotosRequest(treeId: string, personId: string) {
  return sendListPersonPhotosConverted(treeId, personId, new ListPersonPhotosRequest());
}
