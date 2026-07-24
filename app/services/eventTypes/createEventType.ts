import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import CreateEventTypeRequest from "~/services/eventTypes/dtos/requests/CreateEventTypeRequest";
import CreateEventTypeResponseFactory from "~/services/eventTypes/factories/CreateEventTypeResponseFactory";

export async function sendCreateEventTypeConverted(request: CreateEventTypeRequest) {
  return sendAsyncDefaultFetchRequest('event-types/', request, new CreateEventTypeResponseFactory(), 'POST');
}

export default async function sendCreateEventTypeRequest(name: string, primaryPersonsCount: number, primaryPersonsMode: string) {
  return sendCreateEventTypeConverted(new CreateEventTypeRequest(name, primaryPersonsCount, primaryPersonsMode));
}
