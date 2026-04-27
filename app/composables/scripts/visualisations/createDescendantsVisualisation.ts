import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import CreateVisualisationRequest from "~/composables/scripts/visualisations/dtos/requests/CreateVisualisationRequest";
import CreateVisualisationResponseFactory from "~/composables/scripts/visualisations/factories/CreateVisualisationResponseFactory";

export async function sendCreateDescendantsVisualisationConverted(treeId: string, request: CreateVisualisationRequest) {
  return sendAsyncDefaultFetchRequest(`visualisations/${treeId}/descendants`, request, new CreateVisualisationResponseFactory(), 'POST');
}

export default async function sendCreateDescendantsVisualisationRequest(
  treeId: string,
  rootPersonId?: string,
  includedPersonIds?: string[]
) {
  return sendCreateDescendantsVisualisationConverted(treeId, new CreateVisualisationRequest(rootPersonId, includedPersonIds));
}
