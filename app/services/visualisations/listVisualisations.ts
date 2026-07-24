import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import ListVisualisationsRequest from "~/services/visualisations/dtos/requests/ListVisualisationsRequest";
import ListVisualisationsResponseFactory from "~/services/visualisations/factories/ListVisualisationsResponseFactory";

export async function sendListVisualisationsConverted(treeId: string, request: ListVisualisationsRequest) {
  return sendAsyncDefaultFetchRequest(`visualisations/${treeId}`, request, new ListVisualisationsResponseFactory(), 'GET');
}

export default async function sendListVisualisationsRequest(treeId: string) {
  return sendListVisualisationsConverted(treeId, new ListVisualisationsRequest());
}
