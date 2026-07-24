import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import UpdateEventRequest from "~/services/events/dtos/requests/UpdateEventRequest";
import UpdateEventResponseFactory from "~/services/events/factories/UpdateEventResponseFactory";

export async function sendUpdateEventConverted(treeId: string, eventId: string, request: UpdateEventRequest) {
  return sendAsyncDefaultFetchRequest(`events/${treeId}/${eventId}`, request, new UpdateEventResponseFactory(), 'PUT');
}

export default async function sendUpdateEventRequest(treeId: string, eventId: string, request: UpdateEventRequest) {
  return sendUpdateEventConverted(treeId, eventId, request);
}
