import {sendAsyncDefaultFetchRequest} from "~/services/api/sendDefaultRequest";
import ListTreeAccessEmailsRequest from "~/services/familytree/dtos/requests/ListTreeAccessEmailsRequest";
import ListTreeAccessEmailsResponseFactory from "~/services/familytree/factories/ListTreeAccessEmailsResponseFactory";

export async function sendListTreeAccessEmailsConverted(treeId: string, request: ListTreeAccessEmailsRequest) {
  return sendAsyncDefaultFetchRequest(`familytree/${treeId}/access-emails`, request, new ListTreeAccessEmailsResponseFactory(), 'GET');
}

export default async function sendListTreeAccessEmailsRequest(treeId: string) {
  return sendListTreeAccessEmailsConverted(treeId, new ListTreeAccessEmailsRequest());
}
