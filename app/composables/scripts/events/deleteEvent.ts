import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import DeleteEventRequest from "~/composables/scripts/events/dtos/requests/DeleteEventRequest";
import DeleteEventResponseFactory from "~/composables/scripts/events/factories/DeleteEventResponseFactory";

export async function sendDeleteEventConverted(treeId: string, eventId: string, request: DeleteEventRequest) {
  return sendAsyncDefaultFetchRequest(`events/${treeId}/${eventId}`, request, new DeleteEventResponseFactory(), 'DELETE');
}

export default async function sendDeleteEventRequest(treeId: string, eventId: string) {
  return sendDeleteEventConverted(treeId, eventId, new DeleteEventRequest());
}
