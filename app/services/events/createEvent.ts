import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import CreateEventRequest from "~/services/events/dtos/requests/CreateEventRequest";
import CreateEventResponseFactory from "~/services/events/factories/CreateEventResponseFactory";

export async function sendCreateEventConverted(treeId: string, request: CreateEventRequest) {
  return sendAsyncDefaultFetchRequest(`events/${treeId}`, request, new CreateEventResponseFactory(), 'POST');
}

export default async function sendCreateEventRequest(treeId: string, request: CreateEventRequest) {
  return sendCreateEventConverted(treeId, request);
}
