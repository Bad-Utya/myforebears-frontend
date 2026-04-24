import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import ListEventsRequest from "~/composables/scripts/events/dtos/requests/ListEventsRequest";
import ListEventsResponseFactory from "~/composables/scripts/events/factories/ListEventsResponseFactory";

export async function sendListEventsConverted(treeId: string, request: ListEventsRequest) {
  return sendAsyncDefaultFetchRequest(`events/${treeId}`, request, new ListEventsResponseFactory(), 'GET');
}

export default async function sendListEventsRequest(treeId: string) {
  return sendListEventsConverted(treeId, new ListEventsRequest());
}
