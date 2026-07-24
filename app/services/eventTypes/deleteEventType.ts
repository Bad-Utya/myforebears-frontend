import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import DeleteEventTypeRequest from "~/services/eventTypes/dtos/requests/DeleteEventTypeRequest";
import DeleteEventTypeResponseFactory from "~/services/eventTypes/factories/DeleteEventTypeResponseFactory";

export async function sendDeleteEventTypeConverted(eventTypeId: string, request: DeleteEventTypeRequest) {
  return sendAsyncDefaultFetchRequest(`event-types/${eventTypeId}`, request, new DeleteEventTypeResponseFactory(), 'DELETE');
}

export default async function sendDeleteEventTypeRequest(eventTypeId: string) {
  return sendDeleteEventTypeConverted(eventTypeId, new DeleteEventTypeRequest());
}
