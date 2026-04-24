import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import GetEventRequest from "~/composables/scripts/events/dtos/requests/GetEventRequest";
import GetEventResponseFactory from "~/composables/scripts/events/factories/GetEventResponseFactory";

export async function sendGetEventConverted(treeId: string, eventId: string, request: GetEventRequest) {
  return sendAsyncDefaultFetchRequest(`events/${treeId}/${eventId}`, request, new GetEventResponseFactory(), 'GET');
}

export default async function sendGetEventRequest(treeId: string, eventId: string) {
  return sendGetEventConverted(treeId, eventId, new GetEventRequest());
}
