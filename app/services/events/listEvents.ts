import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import ListEventsRequest from "~/services/events/dtos/requests/ListEventsRequest";
import ListEventsResponseFactory from "~/services/events/factories/ListEventsResponseFactory";

export async function sendListEventsConverted(treeId: string, request: ListEventsRequest) {
  return sendAsyncDefaultFetchRequest(`events/${treeId}`, request, new ListEventsResponseFactory(), 'GET');
}

export default async function sendListEventsRequest(treeId: string) {
  return sendListEventsConverted(treeId, new ListEventsRequest());
}
