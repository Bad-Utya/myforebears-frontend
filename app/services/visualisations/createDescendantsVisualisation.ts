import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import CreateVisualisationRequest from "~/services/visualisations/dtos/requests/CreateVisualisationRequest";
import CreateVisualisationResponseFactory from "~/services/visualisations/factories/CreateVisualisationResponseFactory";

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
