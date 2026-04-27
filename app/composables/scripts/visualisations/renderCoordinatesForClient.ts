import {sendAsyncRawFetchRequest} from "~/composables/scripts/api/sendRawRequest";
import RenderCoordinatesForClientRequest from "~/composables/scripts/visualisations/dtos/requests/RenderCoordinatesForClientRequest";
import RenderCoordinatesForClientResponseFactory from "~/composables/scripts/visualisations/factories/RenderCoordinatesForClientResponseFactory";

export async function sendRenderCoordinatesForClientConverted(treeId: string, request: RenderCoordinatesForClientRequest) {
  return sendAsyncRawFetchRequest(`visualisations/${treeId}/coordinates`, request, new RenderCoordinatesForClientResponseFactory(), 'POST');
}

export default async function sendRenderCoordinatesForClientRequest(treeId: string, rootPersonId?: string, maxDepth?: number) {
  return sendRenderCoordinatesForClientConverted(treeId, new RenderCoordinatesForClientRequest(rootPersonId, maxDepth));
}
