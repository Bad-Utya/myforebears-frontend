import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import SearchTreesRequest from "~/services/familytree/dtos/requests/SearchTreesRequest";
import GetTreeResponseFactory from "~/services/familytree/factories/GetTreeResponseFactory";

export async function sendSearchPublicTreesRequest(name: string, limit: number = 10) {
  const query = `name=${encodeURIComponent(name)}&limit=${limit}`;
  return sendAsyncDefaultFetchRequest(`familytree/public/search?${query}`, new SearchTreesRequest(name, limit), new GetTreeResponseFactory(), 'GET');
}
