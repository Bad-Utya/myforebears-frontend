import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import ListEventPhotosRequest from "~/composables/scripts/photos/dtos/requests/ListEventPhotosRequest";
import ListEventPhotosResponseFactory from "~/composables/scripts/photos/factories/ListEventPhotosResponseFactory";

export async function sendListEventPhotosConverted(treeId: string, eventId: string, request: ListEventPhotosRequest) {
  return sendAsyncDefaultFetchRequest(`photos/${treeId}/events/${eventId}`, request, new ListEventPhotosResponseFactory(), 'GET');
}

export default async function sendListEventPhotosRequest(treeId: string, eventId: string) {
  return sendListEventPhotosConverted(treeId, eventId, new ListEventPhotosRequest());
}
