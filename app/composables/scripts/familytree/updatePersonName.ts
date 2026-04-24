import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import UpdatePersonNameRequest from "~/composables/scripts/familytree/dtos/requests/UpdatePersonNameRequest";
import UpdatePersonNameResponseFactory from "~/composables/scripts/familytree/factories/UpdatePersonNameResponseFactory";

export async function sendUpdatePersonNameConverted(treeId: string, personId: string, request: UpdatePersonNameRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/persons/${personId}`, request, new UpdatePersonNameResponseFactory(), 'PATCH');
}

export default async function sendUpdatePersonNameRequest(treeId: string, personId: string, firstName: string, lastName: string, patronymic: string) {
  return sendUpdatePersonNameConverted(treeId, personId, new UpdatePersonNameRequest(firstName, lastName, patronymic));
}
