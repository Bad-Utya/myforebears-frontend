import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import GetEventRequest from "~/services/events/dtos/requests/GetEventRequest";
import GetEventResponseFactory from "~/services/events/factories/GetEventResponseFactory";

export async function sendGetEventConverted(treeId: string, eventId: string, request: GetEventRequest) {
  return sendAsyncDefaultFetchRequest(`events/${treeId}/${eventId}`, request, new GetEventResponseFactory(), 'GET');
}

export default async function sendGetEventRequest(treeId: string, eventId: string) {
  return sendGetEventConverted(treeId, eventId, new GetEventRequest());
}
