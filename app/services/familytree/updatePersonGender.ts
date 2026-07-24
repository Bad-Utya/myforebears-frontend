import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import UpdatePersonGenderRequest, {type UpdatePersonGenderValue} from "~/services/familytree/dtos/requests/UpdatePersonGenderRequest";
import UpdatePersonNameResponseFactory from "~/services/familytree/factories/UpdatePersonNameResponseFactory";

export async function sendUpdatePersonGenderConverted(treeId: string, personId: string, request: UpdatePersonGenderRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/persons/${personId}/gender`, request, new UpdatePersonNameResponseFactory(), 'PATCH');
}

export default async function sendUpdatePersonGenderRequest(treeId: string, personId: string, gender: UpdatePersonGenderValue) {
  return sendUpdatePersonGenderConverted(treeId, personId, new UpdatePersonGenderRequest(gender));
}
