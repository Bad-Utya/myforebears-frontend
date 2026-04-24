import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import ListEventTypesRequest from "~/composables/scripts/eventTypes/dtos/requests/ListEventTypesRequest";
import ListEventTypesResponseFactory from "~/composables/scripts/eventTypes/factories/ListEventTypesResponseFactory";

export async function sendListEventTypesConverted(request: ListEventTypesRequest) {
  return sendAsyncDefaultFetchRequest('event-types/', request, new ListEventTypesResponseFactory(), 'GET');
}

export default async function sendListEventTypesRequest() {
  return sendListEventTypesConverted(new ListEventTypesRequest());
}
