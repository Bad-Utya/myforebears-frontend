import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import CreateVisualisationRequest from "~/services/visualisations/dtos/requests/CreateVisualisationRequest";
import CreateVisualisationResponseFactory from "~/services/visualisations/factories/CreateVisualisationResponseFactory";

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
