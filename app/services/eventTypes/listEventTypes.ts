import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import ListEventTypesRequest from "~/services/eventTypes/dtos/requests/ListEventTypesRequest";
import ListEventTypesResponseFactory from "~/services/eventTypes/factories/ListEventTypesResponseFactory";

export async function sendListEventTypesConverted(request: ListEventTypesRequest) {
  return sendAsyncDefaultFetchRequest('event-types/', request, new ListEventTypesResponseFactory(), 'GET');
}

export default async function sendListEventTypesRequest() {
  return sendListEventTypesConverted(new ListEventTypesRequest());
}
