import {sendAsyncBinaryFetchRequest} from "~/composables/scripts/api/sendBinaryRequest";
import GetVisualisationRequest from "~/composables/scripts/visualisations/dtos/requests/GetVisualisationRequest";

export async function sendGetVisualisationConverted(treeId: string, visualisationId: string, _request: GetVisualisationRequest) {
  return sendAsyncBinaryFetchRequest(`visualisations/${treeId}/${visualisationId}`, 'GET');
}

export default async function sendGetVisualisationRequest(treeId: string, visualisationId: string) {
  return sendGetVisualisationConverted(treeId, visualisationId, new GetVisualisationRequest());
}
