import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import CreateVisualisationRequest from "~/composables/scripts/visualisations/dtos/requests/CreateVisualisationRequest";
import CreateVisualisationResponseFactory from "~/composables/scripts/visualisations/factories/CreateVisualisationResponseFactory";

export async function sendCreateAncestorsDescendantsVisualisationConverted(treeId: string, request: CreateVisualisationRequest) {
  return sendAsyncDefaultFetchRequest(`visualisations/${treeId}/ancestors-descendants`, request, new CreateVisualisationResponseFactory(), 'POST');
}

export default async function sendCreateAncestorsDescendantsVisualisationRequest(
  treeId: string,
  rootPersonId?: string,
  includedPersonIds?: string[]
) {
  return sendCreateAncestorsDescendantsVisualisationConverted(treeId, new CreateVisualisationRequest(rootPersonId, includedPersonIds));
}
