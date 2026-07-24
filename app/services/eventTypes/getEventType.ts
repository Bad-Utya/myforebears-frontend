import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import GetEventTypeRequest from "~/services/eventTypes/dtos/requests/GetEventTypeRequest";
import GetEventTypeResponseFactory from "~/services/eventTypes/factories/GetEventTypeResponseFactory";

export async function sendGetEventTypeConverted(eventTypeId: string, request: GetEventTypeRequest) {
  return sendAsyncDefaultFetchRequest(`event-types/${eventTypeId}`, request, new GetEventTypeResponseFactory(), 'GET');
}

export default async function sendGetEventTypeRequest(eventTypeId: string) {
  return sendGetEventTypeConverted(eventTypeId, new GetEventTypeRequest());
}
