import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import CreateVisualisationRequest from "~/composables/scripts/visualisations/dtos/requests/CreateVisualisationRequest";
import CreateVisualisationResponseFactory from "~/composables/scripts/visualisations/factories/CreateVisualisationResponseFactory";

export async function sendCreateAncestorsVisualisationConverted(treeId: string, request: CreateVisualisationRequest) {
  return sendAsyncDefaultFetchRequest(`visualisations/${treeId}/ancestors`, request, new CreateVisualisationResponseFactory(), 'POST');
}

export default async function sendCreateAncestorsVisualisationRequest(
  treeId: string,
  rootPersonId?: string,
  includedPersonIds?: string[]
) {
  return sendCreateAncestorsVisualisationConverted(treeId, new CreateVisualisationRequest(rootPersonId, includedPersonIds));
}
