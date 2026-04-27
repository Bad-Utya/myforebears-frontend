import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import ListVisualisationsRequest from "~/composables/scripts/visualisations/dtos/requests/ListVisualisationsRequest";
import ListVisualisationsResponseFactory from "~/composables/scripts/visualisations/factories/ListVisualisationsResponseFactory";

export async function sendListVisualisationsConverted(treeId: string, request: ListVisualisationsRequest) {
  return sendAsyncDefaultFetchRequest(`visualisations/${treeId}`, request, new ListVisualisationsResponseFactory(), 'GET');
}

export default async function sendListVisualisationsRequest(treeId: string) {
  return sendListVisualisationsConverted(treeId, new ListVisualisationsRequest());
}
