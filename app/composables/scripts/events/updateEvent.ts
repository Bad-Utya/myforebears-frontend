import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import UpdateEventRequest from "~/composables/scripts/events/dtos/requests/UpdateEventRequest";
import UpdateEventResponseFactory from "~/composables/scripts/events/factories/UpdateEventResponseFactory";

export async function sendUpdateEventConverted(treeId: string, eventId: string, request: UpdateEventRequest) {
  return sendAsyncDefaultFetchRequest(`events/${treeId}/${eventId}`, request, new UpdateEventResponseFactory(), 'PUT');
}

export default async function sendUpdateEventRequest(treeId: string, eventId: string, request: UpdateEventRequest) {
  return sendUpdateEventConverted(treeId, eventId, request);
}
