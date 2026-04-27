import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import CreateVisualisationRequest from "~/composables/scripts/visualisations/dtos/requests/CreateVisualisationRequest";
import CreateVisualisationResponseFactory from "~/composables/scripts/visualisations/factories/CreateVisualisationResponseFactory";

export async function sendCreateFullVisualisationConverted(treeId: string, request: CreateVisualisationRequest) {
  return sendAsyncDefaultFetchRequest(`visualisations/${treeId}/full`, request, new CreateVisualisationResponseFactory(), 'POST');
}

export default async function sendCreateFullVisualisationRequest(
  treeId: string,
  rootPersonId?: string,
  includedPersonIds?: string[]
) {
  return sendCreateFullVisualisationConverted(treeId, new CreateVisualisationRequest(rootPersonId, includedPersonIds));
}
