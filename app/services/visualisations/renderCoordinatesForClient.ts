import {sendAsyncRawFetchRequest} from "~/services/api/sendRawRequest";
import RenderCoordinatesForClientRequest from "~/services/visualisations/dtos/requests/RenderCoordinatesForClientRequest";
import RenderCoordinatesForClientResponseFactory from "~/services/visualisations/factories/RenderCoordinatesForClientResponseFactory";

export async function sendRenderCoordinatesForClientConverted(treeId: string, request: RenderCoordinatesForClientRequest) {
  return sendAsyncRawFetchRequest(`visualisations/${treeId}/coordinates`, request, new RenderCoordinatesForClientResponseFactory(), 'POST');
}

export default async function sendRenderCoordinatesForClientRequest(treeId: string, rootPersonId?: string, maxDepth?: number) {
  return sendRenderCoordinatesForClientConverted(treeId, new RenderCoordinatesForClientRequest(rootPersonId, maxDepth));
}
