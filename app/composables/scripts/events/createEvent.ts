import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import CreateEventRequest from "~/composables/scripts/events/dtos/requests/CreateEventRequest";
import CreateEventResponseFactory from "~/composables/scripts/events/factories/CreateEventResponseFactory";

export async function sendCreateEventConverted(treeId: string, request: CreateEventRequest) {
  return sendAsyncDefaultFetchRequest(`events/${treeId}`, request, new CreateEventResponseFactory(), 'POST');
}

export default async function sendCreateEventRequest(treeId: string, request: CreateEventRequest) {
  return sendCreateEventConverted(treeId, request);
}
