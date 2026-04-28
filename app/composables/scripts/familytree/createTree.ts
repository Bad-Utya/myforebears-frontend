import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import CreateTreeRequest from "~/composables/scripts/familytree/dtos/requests/CreateTreeRequest";
import CreateTreeResponseFactory from "~/composables/scripts/familytree/factories/CreateTreeResponseFactory";

export async function sendCreateTreeConverted(request: CreateTreeRequest) {
  return sendAsyncDefaultFetchRequest('familytree/', request, new CreateTreeResponseFactory(), 'POST');
}

export default async function sendCreateTreeRequest(name?: string, description?: string) {
  return sendCreateTreeConverted(new CreateTreeRequest(name, description));
}
