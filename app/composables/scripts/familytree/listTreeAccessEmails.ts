import {sendAsyncDefaultFetchRequest} from "~/composables/scripts/api/sendDefaultRequest";
import ListTreeAccessEmailsRequest from "~/composables/scripts/familytree/dtos/requests/ListTreeAccessEmailsRequest";
import ListTreeAccessEmailsResponseFactory from "~/composables/scripts/familytree/factories/ListTreeAccessEmailsResponseFactory";

export async function sendListTreeAccessEmailsConverted(treeId: string, request: ListTreeAccessEmailsRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/access-emails`, request, new ListTreeAccessEmailsResponseFactory(), 'GET');
}

export default async function sendListTreeAccessEmailsRequest(treeId: string) {
  return sendListTreeAccessEmailsConverted(treeId, new ListTreeAccessEmailsRequest());
}
