import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import CreateVisualisationRequest from "~/services/visualisations/dtos/requests/CreateVisualisationRequest";
import CreateVisualisationResponseFactory from "~/services/visualisations/factories/CreateVisualisationResponseFactory";

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
