import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import DeleteEventTypeRequest from "~/composables/scripts/eventTypes/dtos/requests/DeleteEventTypeRequest";
import DeleteEventTypeResponseFactory from "~/composables/scripts/eventTypes/factories/DeleteEventTypeResponseFactory";

export async function sendDeleteEventTypeConverted(eventTypeId: string, request: DeleteEventTypeRequest) {
  return sendAsyncDefaultFetchRequest(`event-types/${eventTypeId}`, request, new DeleteEventTypeResponseFactory(), 'DELETE');
}

export default async function sendDeleteEventTypeRequest(eventTypeId: string) {
  return sendDeleteEventTypeConverted(eventTypeId, new DeleteEventTypeRequest());
}
