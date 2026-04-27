import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import DeleteVisualisationRequest from "~/composables/scripts/visualisations/dtos/requests/DeleteVisualisationRequest";
import DeleteVisualisationResponseFactory from "~/composables/scripts/visualisations/factories/DeleteVisualisationResponseFactory";

export async function sendDeleteVisualisationConverted(treeId: string, visualisationId: string, request: DeleteVisualisationRequest) {
  return sendAsyncDefaultFetchRequest(`visualisations/${treeId}/${visualisationId}`, request, new DeleteVisualisationResponseFactory(), 'DELETE');
}

export default async function sendDeleteVisualisationRequest(treeId: string, visualisationId: string) {
  return sendDeleteVisualisationConverted(treeId, visualisationId, new DeleteVisualisationRequest());
}
