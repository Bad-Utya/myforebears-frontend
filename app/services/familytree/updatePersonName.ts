import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import UpdatePersonNameRequest from "~/services/familytree/dtos/requests/UpdatePersonNameRequest";
import UpdatePersonNameResponseFactory from "~/services/familytree/factories/UpdatePersonNameResponseFactory";

export async function sendUpdatePersonNameConverted(treeId: string, personId: string, request: UpdatePersonNameRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/persons/${personId}`, request, new UpdatePersonNameResponseFactory(), 'PATCH');
}

export default async function sendUpdatePersonNameRequest(treeId: string, personId: string, firstName: string, lastName: string, patronymic: string) {
  return sendUpdatePersonNameConverted(treeId, personId, new UpdatePersonNameRequest(firstName, lastName, patronymic));
}
