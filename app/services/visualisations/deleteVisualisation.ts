import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import DeleteVisualisationRequest from "~/services/visualisations/dtos/requests/DeleteVisualisationRequest";
import DeleteVisualisationResponseFactory from "~/services/visualisations/factories/DeleteVisualisationResponseFactory";

export async function sendDeleteVisualisationConverted(treeId: string, visualisationId: string, request: DeleteVisualisationRequest) {
  return sendAsyncDefaultFetchRequest(`visualisations/${treeId}/${visualisationId}`, request, new DeleteVisualisationResponseFactory(), 'DELETE');
}

export default async function sendDeleteVisualisationRequest(treeId: string, visualisationId: string) {
  return sendDeleteVisualisationConverted(treeId, visualisationId, new DeleteVisualisationRequest());
}
