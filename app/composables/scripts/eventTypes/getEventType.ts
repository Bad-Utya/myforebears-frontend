import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import GetEventTypeRequest from "~/composables/scripts/eventTypes/dtos/requests/GetEventTypeRequest";
import GetEventTypeResponseFactory from "~/composables/scripts/eventTypes/factories/GetEventTypeResponseFactory";

export async function sendGetEventTypeConverted(eventTypeId: string, request: GetEventTypeRequest) {
  return sendAsyncDefaultFetchRequest(`event-types/${eventTypeId}`, request, new GetEventTypeResponseFactory(), 'GET');
}

export default async function sendGetEventTypeRequest(eventTypeId: string) {
  return sendGetEventTypeConverted(eventTypeId, new GetEventTypeRequest());
}
