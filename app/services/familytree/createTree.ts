import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import CreateTreeRequest from "~/services/familytree/dtos/requests/CreateTreeRequest";
import CreateTreeResponseFactory from "~/services/familytree/factories/CreateTreeResponseFactory";

export async function sendCreateTreeConverted(request: CreateTreeRequest) {
  return sendAsyncDefaultFetchRequest('familytree/', request, new CreateTreeResponseFactory(), 'POST');
}

export default async function sendCreateTreeRequest(name?: string, description?: string) {
  return sendCreateTreeConverted(new CreateTreeRequest(name, description));
}
